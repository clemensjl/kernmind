import { NextRequest, NextResponse } from 'next/server';
import { createCard, getSettings } from '@/lib/db';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeCardWithAI } from '@/lib/ai';
import { extractHexCodesFromText, getColorName } from '@/lib/colors';
import { Card, CardType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = getSettings();

    let {
      url,
      text,
      title,
      type,
      imageUrl,
      author,
      tags = [],
      colors = [],
      price,
      currency,
    } = body;

    let detectedType: CardType = type || 'note';
    let content = text || '';
    let finalTitle = title || '';
    let domain: string | undefined;
    let favicon: string | undefined;
    let estimatedReadTime: number | undefined;
    let summary: string | undefined;

    // 1. If URL is supplied, scrape metadata & full reader view
    if (url) {
      const scraped = await scrapeUrl(url);
      url = scraped.url;
      domain = scraped.domain;
      favicon = scraped.favicon;
      imageUrl = imageUrl || scraped.imageUrl;
      author = author || scraped.author;
      price = price || scraped.price;
      currency = currency || scraped.currency;
      estimatedReadTime = scraped.estimatedReadTime;

      if (!finalTitle) finalTitle = scraped.title;
      if (!content) content = scraped.content;
      if (!type) detectedType = scraped.detectedType;
    }

    // 2. Check if content is a Hex color code or contains colors
    const foundHexes = extractHexCodesFromText(content || finalTitle || '');
    if (foundHexes.length > 0) {
      colors = Array.from(new Set([...colors, ...foundHexes]));
      if (!type && (content.trim().startsWith('#') || finalTitle.trim().startsWith('#'))) {
        detectedType = 'color';
        if (!finalTitle || finalTitle.startsWith('#')) {
          finalTitle = `${getColorName(foundHexes[0])} (${foundHexes[0]})`;
        }
      }
    }

    // 3. Check for quotes or highlights
    if (!type) {
      if (
        (content.startsWith('“') && content.endsWith('”')) ||
        (content.startsWith('"') && content.endsWith('"')) ||
        tags.includes('#quote')
      ) {
        detectedType = 'quote';
      } else if (imageUrl && !url) {
        detectedType = 'image';
      }
    }

    if (!finalTitle) {
      finalTitle = content ? content.substring(0, 48) + (content.length > 48 ? '...' : '') : 'Untitled Note';
    }

    // 4. Auto-tag and summarize with AI (if auto-tagging is enabled)
    let aiTags: string[] = [];
    if (settings.autoTaggingEnabled) {
      try {
        const aiResult = await analyzeCardWithAI(
          {
            title: finalTitle,
            type: detectedType,
            url,
            content,
          },
          settings
        );
        aiTags = aiResult.tags;
        if (aiResult.summary && !summary) summary = aiResult.summary;
        if (!type && aiResult.detectedType) detectedType = aiResult.detectedType;
      } catch (err) {
        console.warn('AI analysis skipped/failed:', err);
      }
    }

    const mergedTags = Array.from(
      new Set([
        ...tags.map((t: string) => (t.startsWith('#') ? t : `#${t}`)),
        ...aiTags,
      ])
    );

    // 5. Create card in SQLite database
    const newCard = createCard({
      type: detectedType,
      title: finalTitle,
      content,
      url,
      domain,
      imageUrl,
      favicon,
      author,
      price,
      currency,
      colors,
      tags: mergedTags,
      summary,
      estimatedReadTime,
      isFavorite: false,
      isArchived: false,
      readingProgress: 0,
    });

    return NextResponse.json({ success: true, card: newCard }, { status: 201 });
  } catch (error: any) {
    console.error('Capture endpoint error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
