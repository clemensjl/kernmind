import { NextRequest, NextResponse } from 'next/server';
import { deleteSmartSpace } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteSmartSpace(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Space not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Smart Space removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
