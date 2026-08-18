import { Card, Settings, AIProvider, ChatMessage } from './types';

export interface AIAnalysisResult {
  tags: string[];
  summary?: string;
  detectedType?: Card['type'];
  extractedText?: string;
}

export async function analyzeCardWithAI(
  card: Partial<Card>,
  settings: Settings
): Promise<AIAnalysisResult> {
  const provider = settings.aiProvider;

  // If local heuristic is selected or no API keys configured, use offline heuristic
  if (provider === 'local_heuristic' || (!hasApiKeyForProvider(provider, settings) && provider !== 'ollama')) {
    return runHeuristicTagging(card);
  }

  const prompt = `You are OpenMind AI, an intelligent personal knowledge assistant inspired by mymind.
Analyze the following saved content and return a JSON object with:
1. "tags": Array of 3-7 lowercase hashtags starting with # (e.g. ["#design", "#minimalism", "#typography", "#inspiration"]).
2. "summary": A concise 1-2 sentence executive summary if it's an article/note, or empty string.
3. "detectedType": One of ["note", "quote", "highlight", "article", "image", "color", "product", "book", "code", "file"].

Content details:
- Title: ${card.title || 'Untitled'}
- Type: ${card.type || 'unknown'}
- URL: ${card.url || ''}
- Content snippet: ${(card.content || card.ocrText || '').substring(0, 1500)}

Respond ONLY with valid JSON in this exact structure:
{"tags": ["#tag1", "#tag2"], "summary": "...", "detectedType": "article"}`;

  try {
    const jsonStr = await executeLLMCall(prompt, provider, settings);
    const parsed = parseJsonSafely(jsonStr);
    return {
      tags: sanitizeTags(parsed.tags || []),
      summary: parsed.summary || undefined,
      detectedType: parsed.detectedType || card.type,
    };
  } catch (error) {
    console.error('AI analysis error, falling back to heuristics:', error);
    return runHeuristicTagging(card);
  }
}

export async function askMindChat(
  query: string,
  cards: Card[],
  history: ChatMessage[],
  settings: Settings
): Promise<{ answer: string; referencedCardIds: string[] }> {
  const provider = settings.aiProvider;

  // Build context from cards
  const contextList = cards.slice(0, 20).map((c, i) => {
    return `[Memory #${i + 1} | ID: ${c.id}]
Type: ${c.type}
Title: ${c.title}
Author: ${c.author || 'N/A'}
Tags: ${c.tags.join(', ')}
URL: ${c.url || 'N/A'}
Content: ${(c.content || c.summary || c.ocrText || '').substring(0, 400)}`;
  }).join('\n\n---\n\n');

  const historyContext = history.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

  const prompt = `You are OpenMind, the user's private, trusted Second Brain AI companion.
You have instant access to the user's personal memories, articles, quotes, notes, and saved items.

User query: "${query}"

Here are the most relevant saved items from the user's mind:
${contextList}

Recent conversation:
${historyContext}

Instructions:
1. Answer the user's query accurately using their saved knowledge.
2. If relevant items exist, cite them explicitly (e.g. "According to your saved note on *[Title]*..." or "[Title](card://<ID>)").
3. If no relevant item is found, answer gracefully and state that no matching memory was found in their mind yet.
4. At the very end of your response, output a JSON line:
{"referencedIds": ["id1", "id2"]}`;

  if (provider === 'local_heuristic' || (!hasApiKeyForProvider(provider, settings) && provider !== 'ollama')) {
    // Offline heuristic answer
    const matches = cards.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      (c.content && c.content.toLowerCase().includes(query.toLowerCase())) ||
      c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );

    if (matches.length === 0) {
      return {
        answer: `I searched your mind for **"${query}"**, but didn't find any direct matches. To enable deeper semantic reasoning across your knowledge base, connect your OpenAI, Gemini, Claude, or Ollama API key in **Settings**.`,
        referencedCardIds: [],
      };
    }

    const titles = matches.slice(0, 3).map(m => `• **${m.title}** (${m.type}) - ${m.tags.join(' ')}`).join('\n');
    return {
      answer: `Found ${matches.length} relevant item(s) in your Mind matching **"${query}"**:\n\n${titles}\n\n*Tip: Connect your BYOK API Key in Settings to get full conversational AI synthesis.*`,
      referencedCardIds: matches.slice(0, 3).map(m => m.id),
    };
  }

  try {
    const rawResponse = await executeLLMCall(prompt, provider, settings);
    
    // Extract referenced IDs if present
    const refMatch = rawResponse.match(/\{"referencedIds":\s*\[(.*?)\]\}/);
    let referencedCardIds: string[] = [];
    let cleanAnswer = rawResponse;

    if (refMatch) {
      cleanAnswer = rawResponse.replace(refMatch[0], '').trim();
      try {
        const parsed = JSON.parse(refMatch[0]);
        referencedCardIds = parsed.referencedIds || [];
      } catch {}
    }

    // If no explicit referencedIds parsed, find cards whose IDs or titles are mentioned
    if (referencedCardIds.length === 0) {
      referencedCardIds = cards
        .filter(c => cleanAnswer.includes(c.title) || cleanAnswer.includes(c.id))
        .slice(0, 4)
        .map(c => c.id);
    }

    return {
      answer: cleanAnswer,
      referencedCardIds,
    };
  } catch (error: any) {
    return {
      answer: `An error occurred while querying your AI model (${error.message || 'API error'}). Please check your API key in Settings.`,
      referencedCardIds: [],
    };
  }
}

async function executeLLMCall(prompt: string, provider: AIProvider, settings: Settings): Promise<string> {
  if (provider === 'gemini') {
    const key = settings.apiKeys.gemini;
    if (!key) throw new Error('Google Gemini API Key is missing.');
    const model = settings.selectedModels.gemini || 'gemini-1.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai' || provider === 'groq' || provider === 'openrouter') {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let key = settings.apiKeys.openai;
    let model = settings.selectedModels.openai || 'gpt-4o-mini';

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      key = settings.apiKeys.groq;
      model = settings.selectedModels.groq || 'llama-3.3-70b-versatile';
    } else if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      key = settings.apiKeys.openrouter;
      model = settings.selectedModels.openrouter || 'meta-llama/llama-3.3-70b-instruct';
    }

    if (!key) throw new Error(`${provider} API Key is missing.`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${provider} API Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'claude') {
    const key = settings.apiKeys.claude;
    if (!key) throw new Error('Anthropic Claude API Key is missing.');
    const model = settings.selectedModels.claude || 'claude-3-5-haiku-20241022';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  if (provider === 'ollama') {
    const baseUrl = settings.ollamaBaseUrl || 'http://localhost:11434';
    const model = settings.selectedModels.ollama || 'llama3.2';

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.response || '';
  }

  throw new Error(`Unsupported AI Provider: ${provider}`);
}

function hasApiKeyForProvider(provider: AIProvider, settings: Settings): boolean {
  if (provider === 'openai') return Boolean(settings.apiKeys.openai);
  if (provider === 'gemini') return Boolean(settings.apiKeys.gemini);
  if (provider === 'claude') return Boolean(settings.apiKeys.claude);
  if (provider === 'groq') return Boolean(settings.apiKeys.groq);
  if (provider === 'openrouter') return Boolean(settings.apiKeys.openrouter);
  return false;
}

function runHeuristicTagging(card: Partial<Card>): AIAnalysisResult {
  const tags = new Set<string>();
  const text = `${card.title || ''} ${card.content || ''} ${card.url || ''} ${card.domain || ''}`.toLowerCase();

  // Basic category heuristics
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma')) tags.add('#design');
  if (text.includes('ai') || text.includes('llm') || text.includes('gpt') || text.includes('model')) tags.add('#ai');
  if (text.includes('code') || text.includes('github') || text.includes('typescript') || text.includes('react')) tags.add('#development');
  if (text.includes('architecture') || text.includes('interior') || text.includes('building')) tags.add('#architecture');
  if (text.includes('philosophy') || text.includes('psychology') || text.includes('mind')) tags.add('#philosophy');
  if (text.includes('book') || text.includes('author') || text.includes('novel')) tags.add('#books');
  if (text.includes('product') || text.includes('price') || text.includes('$') || text.includes('€')) tags.add('#product');
  if (text.includes('quote') || card.type === 'quote') tags.add('#quote');
  if (text.includes('recipe') || text.includes('cooking') || text.includes('coffee')) tags.add('#food');
  if (card.domain) {
    const cleanDomain = card.domain.replace(/\.[a-z]+$/, '');
    tags.add(`#${cleanDomain}`);
  }

  if (card.type) {
    tags.add(`#${card.type}`);
  }

  if (tags.size === 0) {
    tags.add('#saved');
    tags.add('#inbox');
  }

  return {
    tags: Array.from(tags),
    detectedType: card.type || 'note',
  };
}

function sanitizeTags(rawTags: string[]): string[] {
  return rawTags
    .map(t => {
      let tag = t.trim().toLowerCase();
      if (!tag.startsWith('#')) tag = `#${tag}`;
      return tag.replace(/[^#a-z0-9_-]/g, '');
    })
    .filter(t => t.length > 1);
}

function parseJsonSafely(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {}
  return {};
}
