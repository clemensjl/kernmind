import { NextRequest, NextResponse } from 'next/server';
import { getAllCards, getSettings } from '@/lib/db';
import { askMindChat } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { query, history = [] } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query string is required' }, { status: 400 });
    }

    const settings = getSettings();
    const allCards = getAllCards();

    const response = await askMindChat(query, allCards, history, settings);

    return NextResponse.json({
      success: true,
      answer: response.answer,
      referencedCardIds: response.referencedCardIds,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
