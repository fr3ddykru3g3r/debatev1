import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    const record = await db.getAnalysisById(id);
    if (!record) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Error in GET /api/analyses/[id]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analysis' }, { status: 500 });
  }
}
