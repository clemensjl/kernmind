import { NextRequest, NextResponse } from 'next/server';
import { getAllCards, createCard } from '@/lib/db';
import { CardType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const type = (searchParams.get('type') as CardType) || undefined;
    const color = searchParams.get('color') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const archivedOnly = searchParams.get('archived') === 'true';

    const cards = await getAllCards({
      query,
      type,
      color,
      domain,
      tags,
      favoritesOnly,
      archivedOnly,
    });

    return NextResponse.json({ success: true, count: cards.length, cards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.type) {
      return NextResponse.json({ success: false, error: 'Title and type are required.' }, { status: 400 });
    }

    const card = await createCard(body);
    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
