import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || null;

    const list = await db.getAnalyses(userId);
    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Error in GET /api/analyses:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analyses' }, { status: 500 });
  }
}
