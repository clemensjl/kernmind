import { NextRequest, NextResponse } from 'next/server';
import { getSmartSpaces, createSmartSpace, deleteSmartSpace } from '@/lib/db';

export async function GET() {
  try {
    const spaces = getSmartSpaces();
    return NextResponse.json({ success: true, spaces });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.query) {
      return NextResponse.json({ success: false, error: 'Name and query are required' }, { status: 400 });
    }

    const space = createSmartSpace({
      name: body.name,
      emoji: body.emoji || '✨',
      query: body.query,
      iconColor: body.iconColor,
      isPinned: body.isPinned !== false,
      orderIndex: body.orderIndex || 0,
    });

    return NextResponse.json({ success: true, space }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
