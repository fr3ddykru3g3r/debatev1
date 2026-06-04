import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { reason } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('analyses')
          .update({ flagged: true, flagged_reason: reason })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      } catch (err: any) {
        console.error('Supabase flagging update failed, falling back to local memory database:', err);
      }
    }

    // Local Fallback DB update
    const record = await db.getAnalysisById(id);
    if (!record) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    record.flagged = true;
    record.flagged_reason = reason;
    
    return NextResponse.json(record);

  } catch (error: any) {
    console.error('Error in POST /api/analyses/[id]/flag:', error);
    return NextResponse.json({ error: error.message || 'Failed to update flag state' }, { status: 500 });
  }
}
