import { NextRequest, NextResponse } from 'next/server';
import { createCard } from '@/lib/db';
import { Card } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let importedCards: Partial<Card>[] = [];

    // Check if standard OpenMind export
    if (Array.isArray(body.cards)) {
      importedCards = body.cards;
    } else if (Array.isArray(body)) {
      importedCards = body;
    } else if (body.notes || body.bookmarks) {
      // MyMind or generic bookmark export structure
      const list = body.notes || body.bookmarks || [];
      importedCards = list.map((item: any) => ({
        type: item.type || (item.url ? 'article' : 'note'),
        title: item.title || item.name || 'Imported Item',
        content: item.content || item.text || item.description || '',
        url: item.url || item.link,
        tags: item.tags || [],
        imageUrl: item.image || item.cover,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    }

    let successCount = 0;
    for (const card of importedCards) {
      if (card.title || card.content || card.url) {
        await createCard({
          type: card.type || 'note',
          title: card.title || 'Imported Item',
          content: card.content || '',
          url: card.url,
          domain: card.domain,
          imageUrl: card.imageUrl,
          favicon: card.favicon,
          author: card.author,
          price: card.price,
          currency: card.currency,
          tags: card.tags || ['#imported'],
          colors: card.colors || [],
          summary: card.summary,
        });
        successCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${successCount} item(s)`,
      count: successCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
