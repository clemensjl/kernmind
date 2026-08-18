import { NextRequest, NextResponse } from 'next/server';
import { getSerendipityCards, getAllCards } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const randomCards = await getSerendipityCards(limit);

    // Also find older memories (e.g. > 1 week old)
    const allCards = await getAllCards();
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const forgottenGems = allCards
      .filter(c => new Date(c.createdAt).getTime() < oneWeekAgo)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      serendipity: randomCards,
      forgottenGems,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
