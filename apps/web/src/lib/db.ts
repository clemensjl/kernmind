import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { Card, SmartSpace, Settings, SearchFilter } from './types';

let dbClient: Client | null = null;
let isInitialized = false;

export function getDb(): Client {
  if (!dbClient) {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://') || tursoUrl.startsWith('http://'))) {
      // Cloud Turso / LibSQL Database (For Vercel / Production)
      dbClient = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      });
    } else {
      // Local SQLite Database file
      const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
      if (typeof window === 'undefined' && !fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch {}
      }
      const dbFilePath = path.join(dataDir, 'kernmind.db');
      dbClient = createClient({
        url: `file:${dbFilePath.replace(/\\/g, '/')}`,
      });
    }
  }

  return dbClient;
}

export async function ensureTablesInitialized() {
  if (isInitialized) return;
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      url TEXT,
      domain TEXT,
      imageUrl TEXT,
      favicon TEXT,
      author TEXT,
      price TEXT,
      currency TEXT,
      rating REAL,
      colors TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      ocrText TEXT,
      summary TEXT,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      isArchived INTEGER NOT NULL DEFAULT 0,
      readingProgress INTEGER NOT NULL DEFAULT 0,
      estimatedReadTime INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      query TEXT NOT NULL,
      iconColor TEXT,
      isPinned INTEGER NOT NULL DEFAULT 1,
      orderIndex INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(createdAt);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_cards_favorite ON cards(isFavorite);`);
  } catch {}

  // Check if cards table is empty, if so, seed initial sample items
  const countRes = await db.execute('SELECT COUNT(*) as count FROM cards');
  const count = Number(countRes.rows[0]?.count || 0);

  if (count === 0) {
    await seedInitialData(db);
  }

  isInitialized = true;
}

async function seedInitialData(db: Client) {
  const now = new Date().toISOString();

  const initialCards: Card[] = [
    {
      id: 'seed-quote-1',
      type: 'quote',
      title: 'Design Philosophy Quote',
      content: '“Simplicity is about subtracting the obvious and adding the meaningful.”',
      author: 'John Maeda, The Laws of Simplicity',
      url: 'https://lawsofsimplicity.com',
      domain: 'lawsofsimplicity.com',
      tags: ['#design', '#philosophy', '#quote', '#minimalism'],
      colors: ['#0F172A', '#F8FAFC'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-color-1',
      type: 'color',
      title: 'Warm Terracotta & Sunset Glow',
      content: '#E07A5F',
      tags: ['#color', '#palette', '#terracotta', '#warm', '#design'],
      colors: ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-article-1',
      type: 'article',
      title: 'The Architecture of Autonomous Second Brains',
      summary: 'Exploring how local-first vector embeddings and associative AI memory replace traditional hierarchical note-taking structures.',
      content: `# The Architecture of Autonomous Second Brains\n\nFor decades, digital knowledge management forced humans to think like filing cabinets. We created folders inside folders, tagged with rigid taxonomies, and spent more time organizing than creating.\n\n### The Associative Revolution\nThe human mind doesn't store memories in hierarchical file paths. A scent of coffee might evoke a morning in Lisbon, which reminds you of a typography layout on a café menu, which inspires a new UI component.\n\n> *“We need tools that mimic the associative fluidity of biological cognition.”*\n\nBy leveraging vector embeddings and multimodal vision models locally, we can construct personal memory palaces that index text, colors, shapes, and feelings automatically.`,
      url: 'https://kernmind.app/blog/autonomous-second-brains',
      domain: 'kernmind.app',
      imageUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe802?w=800&auto=format&fit=crop&q=80',
      favicon: 'https://kernmind.app/favicon.ico',
      author: 'Clemens Lechner',
      estimatedReadTime: 4,
      readingProgress: 45,
      tags: ['#ai', '#secondbrain', '#architecture', '#future', '#reading'],
      colors: ['#2B2D42', '#8D99AE', '#EDF2F4'],
      isFavorite: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-image-1',
      type: 'image',
      title: 'Minimalist Scandinavian Architecture Studio',
      content: 'Inspiration for clean lines, warm oak textures, and diffuse natural daylighting.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
      tags: ['#architecture', '#interior', '#minimalism', '#inspiration', '#light'],
      colors: ['#D4A373', '#CCD5AE', '#FAEDCD', '#333333'],
      ocrText: 'STUDIO NORDIC ARCHITECTS — EST 1984',
      isFavorite: false,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: now,
    },
    {
      id: 'seed-note-1',
      type: 'note',
      title: 'Product Principles for KernMind',
      content: '- [x] 100% Data Privacy (All SQLite & Vector stored locally)\n- [x] Zero-effort organization (AI auto-tags and categorizes)\n- [x] Bring Your Own Key (OpenAI, Gemini, Claude, Groq, Ollama)\n- [x] Beautiful distraction-free reader mode\n- [ ] Mobile PWA companion integration',
      tags: ['#kernmind', '#principles', '#roadmap', '#product'],
      colors: ['#1E293B', '#38BDF8'],
      isFavorite: true,
      isArchived: false,
      readingProgress: 0,
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      updatedAt: now,
    }
  ];

  for (const card of initialCards) {
    await db.execute({
      sql: `INSERT INTO cards (
        id, type, title, content, url, domain, imageUrl, favicon, author, price, currency, rating,
        colors, tags, ocrText, summary, isFavorite, isArchived, readingProgress, estimatedReadTime, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        card.id,
        card.type,
        card.title,
        card.content || null,
        card.url || null,
        card.domain || null,
        card.imageUrl || null,
        card.favicon || null,
        card.author || null,
        card.price || null,
        card.currency || null,
        card.rating || null,
        JSON.stringify(card.colors || []),
        JSON.stringify(card.tags || []),
        card.ocrText || null,
        card.summary || null,
        card.isFavorite ? 1 : 0,
        card.isArchived ? 1 : 0,
        card.readingProgress || 0,
        card.estimatedReadTime || null,
        card.createdAt,
        card.updatedAt,
      ],
    });
  }

  const initialSpaces: SmartSpace[] = [
    {
      id: 'space-articles',
      name: 'Deep Reading',
      emoji: '📖',
      query: 'type:article',
      iconColor: '#3B82F6',
      isPinned: true,
      orderIndex: 0,
      createdAt: now,
    },
    {
      id: 'space-design',
      name: 'Design & Visuals',
      emoji: '🎨',
      query: 'tag:#design',
      iconColor: '#EC4899',
      isPinned: true,
      orderIndex: 1,
      createdAt: now,
    },
    {
      id: 'space-ai',
      name: 'AI & Intelligence',
      emoji: '🧠',
      query: 'tag:#ai',
      iconColor: '#8B5CF6',
      isPinned: true,
      orderIndex: 2,
      createdAt: now,
    },
    {
      id: 'space-quotes',
      name: 'Wisdom & Quotes',
      emoji: '💬',
      query: 'type:quote',
      iconColor: '#F59E0B',
      isPinned: true,
      orderIndex: 3,
      createdAt: now,
    }
  ];

  for (const space of initialSpaces) {
    await db.execute({
      sql: `INSERT INTO spaces (id, name, emoji, query, iconColor, isPinned, orderIndex, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [space.id, space.name, space.emoji, space.query, space.iconColor || null, space.isPinned ? 1 : 0, space.orderIndex, space.createdAt],
    });
  }
}

function parseCardRow(row: any): Card {
  let colors: string[] = [];
  let tags: string[] = [];

  try {
    colors = typeof row.colors === 'string' ? JSON.parse(row.colors) : (row.colors || []);
  } catch {}

  try {
    tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
  } catch {}

  return {
    id: String(row.id),
    type: row.type as Card['type'],
    title: String(row.title),
    content: row.content ? String(row.content) : undefined,
    url: row.url ? String(row.url) : undefined,
    domain: row.domain ? String(row.domain) : undefined,
    imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
    favicon: row.favicon ? String(row.favicon) : undefined,
    author: row.author ? String(row.author) : undefined,
    price: row.price ? String(row.price) : undefined,
    currency: row.currency ? String(row.currency) : undefined,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    colors,
    tags,
    ocrText: row.ocrText ? String(row.ocrText) : undefined,
    summary: row.summary ? String(row.summary) : undefined,
    isFavorite: Boolean(row.isFavorite),
    isArchived: Boolean(row.isArchived),
    readingProgress: Number(row.readingProgress || 0),
    estimatedReadTime: row.estimatedReadTime ? Number(row.estimatedReadTime) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function getAllCards(filter?: SearchFilter): Promise<Card[]> {
  await ensureTablesInitialized();
  const db = getDb();

  let query = 'SELECT * FROM cards WHERE 1=1';
  const args: any[] = [];

  if (filter?.archivedOnly) {
    query += ' AND isArchived = 1';
  } else {
    query += ' AND isArchived = 0';
  }

  if (filter?.favoritesOnly) {
    query += ' AND isFavorite = 1';
  }

  if (filter?.type && filter.type !== 'all') {
    query += ' AND type = ?';
    args.push(filter.type);
  }

  if (filter?.domain) {
    query += ' AND domain LIKE ?';
    args.push(`%${filter.domain}%`);
  }

  if (filter?.query) {
    const q = `%${filter.query.toLowerCase()}%`;
    query += ` AND (
      LOWER(title) LIKE ? OR 
      LOWER(content) LIKE ? OR 
      LOWER(summary) LIKE ? OR 
      LOWER(author) LIKE ? OR 
      LOWER(tags) LIKE ? OR 
      LOWER(ocrText) LIKE ? OR 
      LOWER(domain) LIKE ?
    )`;
    args.push(q, q, q, q, q, q, q);
  }

  if (filter?.tags && filter.tags.length > 0) {
    for (const tag of filter.tags) {
      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
      query += ' AND tags LIKE ?';
      args.push(`%${cleanTag}%`);
    }
  }

  if (filter?.color) {
    query += ' AND (colors LIKE ? OR LOWER(tags) LIKE ?)';
    args.push(`%${filter.color}%`, `%${filter.color.toLowerCase()}%`);
  }

  query += ' ORDER BY createdAt DESC';

  const res = await db.execute({ sql: query, args });
  return res.rows.map(parseCardRow);
}

export async function getCardById(id: string): Promise<Card | null> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute({ sql: 'SELECT * FROM cards WHERE id = ?', args: [id] });
  if (res.rows.length === 0) return null;
  return parseCardRow(res.rows[0]);
}

export async function createCard(cardData: Partial<Card> & { type: Card['type']; title: string }): Promise<Card> {
  await ensureTablesInitialized();
  const db = getDb();
  const now = new Date().toISOString();
  const id = cardData.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const card: Card = {
    id,
    type: cardData.type,
    title: cardData.title,
    content: cardData.content || '',
    url: cardData.url,
    domain: cardData.domain,
    imageUrl: cardData.imageUrl,
    favicon: cardData.favicon,
    author: cardData.author,
    price: cardData.price,
    currency: cardData.currency,
    rating: cardData.rating,
    colors: cardData.colors || [],
    tags: cardData.tags || [],
    ocrText: cardData.ocrText,
    summary: cardData.summary,
    isFavorite: cardData.isFavorite || false,
    isArchived: cardData.isArchived || false,
    readingProgress: cardData.readingProgress || 0,
    estimatedReadTime: cardData.estimatedReadTime,
    createdAt: cardData.createdAt || now,
    updatedAt: now,
  };

  await db.execute({
    sql: `INSERT INTO cards (
      id, type, title, content, url, domain, imageUrl, favicon, author, price, currency, rating,
      colors, tags, ocrText, summary, isFavorite, isArchived, readingProgress, estimatedReadTime, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      card.id,
      card.type,
      card.title,
      card.content || null,
      card.url || null,
      card.domain || null,
      card.imageUrl || null,
      card.favicon || null,
      card.author || null,
      card.price || null,
      card.currency || null,
      card.rating || null,
      JSON.stringify(card.colors || []),
      JSON.stringify(card.tags || []),
      card.ocrText || null,
      card.summary || null,
      card.isFavorite ? 1 : 0,
      card.isArchived ? 1 : 0,
      card.readingProgress,
      card.estimatedReadTime || null,
      card.createdAt,
      card.updatedAt,
    ],
  });

  return card;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
  await ensureTablesInitialized();
  const db = getDb();
  const existing = await getCardById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Card = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  await db.execute({
    sql: `UPDATE cards SET
      type = ?,
      title = ?,
      content = ?,
      url = ?,
      domain = ?,
      imageUrl = ?,
      favicon = ?,
      author = ?,
      price = ?,
      currency = ?,
      rating = ?,
      colors = ?,
      tags = ?,
      ocrText = ?,
      summary = ?,
      isFavorite = ?,
      isArchived = ?,
      readingProgress = ?,
      estimatedReadTime = ?,
      updatedAt = ?
    WHERE id = ?`,
    args: [
      updated.type,
      updated.title,
      updated.content || null,
      updated.url || null,
      updated.domain || null,
      updated.imageUrl || null,
      updated.favicon || null,
      updated.author || null,
      updated.price || null,
      updated.currency || null,
      updated.rating || null,
      JSON.stringify(updated.colors || []),
      JSON.stringify(updated.tags || []),
      updated.ocrText || null,
      updated.summary || null,
      updated.isFavorite ? 1 : 0,
      updated.isArchived ? 1 : 0,
      updated.readingProgress,
      updated.estimatedReadTime || null,
      updated.updatedAt,
      id,
    ],
  });

  return updated;
}

export async function deleteCard(id: string): Promise<boolean> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute({ sql: 'DELETE FROM cards WHERE id = ?', args: [id] });
  return res.rowsAffected > 0;
}

export async function getSmartSpaces(): Promise<SmartSpace[]> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute('SELECT * FROM spaces ORDER BY orderIndex ASC, createdAt ASC');
  return res.rows.map((r: any) => ({
    id: String(r.id),
    name: String(r.name),
    emoji: String(r.emoji),
    query: String(r.query),
    iconColor: r.iconColor ? String(r.iconColor) : undefined,
    isPinned: Boolean(r.isPinned),
    orderIndex: Number(r.orderIndex || 0),
    createdAt: String(r.createdAt),
  }));
}

export async function createSmartSpace(space: Omit<SmartSpace, 'id' | 'createdAt'>): Promise<SmartSpace> {
  await ensureTablesInitialized();
  const db = getDb();
  const id = `space-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const newSpace: SmartSpace = {
    ...space,
    id,
    createdAt,
  };

  await db.execute({
    sql: `INSERT INTO spaces (id, name, emoji, query, iconColor, isPinned, orderIndex, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      newSpace.id,
      newSpace.name,
      newSpace.emoji,
      newSpace.query,
      newSpace.iconColor || null,
      newSpace.isPinned ? 1 : 0,
      newSpace.orderIndex,
      newSpace.createdAt,
    ],
  });

  return newSpace;
}

export async function deleteSmartSpace(id: string): Promise<boolean> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute({ sql: 'DELETE FROM spaces WHERE id = ?', args: [id] });
  return res.rowsAffected > 0;
}

export async function getSerendipityCards(limit = 6): Promise<Card[]> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM cards WHERE isArchived = 0 ORDER BY RANDOM() LIMIT ?',
    args: [limit],
  });
  return res.rows.map(parseCardRow);
}

export async function getSettings(): Promise<Settings> {
  await ensureTablesInitialized();
  const db = getDb();
  const res = await db.execute("SELECT value FROM settings WHERE key = 'app_config'");

  const defaultSettings: Settings = {
    aiProvider: (process.env.DEFAULT_AI_PROVIDER as any) || 'local_heuristic',
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || '',
      claude: process.env.ANTHROPIC_API_KEY || '',
      groq: process.env.GROQ_API_KEY || '',
      openrouter: process.env.OPENROUTER_API_KEY || '',
    },
    selectedModels: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-1.5-flash',
      claude: 'claude-3-5-haiku-20241022',
      groq: 'llama-3.3-70b-versatile',
      openrouter: 'meta-llama/llama-3.3-70b-instruct',
      ollama: 'llama3.2',
    },
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    autoTaggingEnabled: true,
    ocrEnabled: true,
    theme: 'cream',
    cardDensity: 'comfortable',
  };

  if (res.rows.length === 0) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(String(res.rows[0].value));
    return {
      ...defaultSettings,
      ...parsed,
      apiKeys: { ...defaultSettings.apiKeys, ...parsed.apiKeys },
      selectedModels: { ...defaultSettings.selectedModels, ...parsed.selectedModels },
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
  await ensureTablesInitialized();
  const db = getDb();
  const current = await getSettings();
  const updated: Settings = {
    ...current,
    ...settings,
    apiKeys: { ...current.apiKeys, ...settings.apiKeys },
    selectedModels: { ...current.selectedModels, ...settings.selectedModels },
  };

  await db.execute({
    sql: `INSERT INTO settings (key, value)
          VALUES ('app_config', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [JSON.stringify(updated)],
  });

  return updated;
}
