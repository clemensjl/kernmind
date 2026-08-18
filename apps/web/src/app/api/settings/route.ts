import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSettings();
    // Mask sensitive keys when returning to frontend if needed or return masked versions
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const saved = saveSettings(updates);
    return NextResponse.json({ success: true, settings: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
