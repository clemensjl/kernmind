import { NextRequest, NextResponse } from 'next/server';
import { getCardById, updateCard, deleteCard } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = getCardById(id);
    if (!card) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updatedCard = updateCard(id, updates);
    if (!updatedCard) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteCard(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Card deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
