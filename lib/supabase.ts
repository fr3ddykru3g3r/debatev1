import { createClient } from '@supabase/supabase-js';
import { AnalysisRecord, ComparisonRecord } from '@/types/analysis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url');

// Real Supabase client instance (or undefined if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Server-side in-memory database mock fallback
class InMemoryDB {
  private analyses: Map<string, AnalysisRecord> = new Map();
  private comparisons: Map<string, ComparisonRecord> = new Map();

  async getAnalyses(userId?: string | null): Promise<AnalysisRecord[]> {
    const list = Array.from(this.analyses.values());
    // Filter by user if specified
    if (userId) {
      return list.filter(a => a.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    return this.analyses.get(id) || null;
  }

  async createAnalysis(data: Omit<AnalysisRecord, 'id' | 'created_at'>): Promise<AnalysisRecord> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const record: AnalysisRecord = {
      ...data,
      id,
      created_at,
    };
    this.analyses.set(id, record);
    return record;
  }

  async createComparison(data: Omit<ComparisonRecord, 'id' | 'created_at'>): Promise<ComparisonRecord> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const record: ComparisonRecord = {
      ...data,
      id,
      created_at,
    };
    this.comparisons.set(id, record);
    return record;
  }
}

// Global state for in-memory database on server
const globalForDB = global as unknown as { inMemoryDB?: InMemoryDB };
export const dbFallback = globalForDB.inMemoryDB ?? new InMemoryDB();
if (process.env.NODE_ENV !== 'production') {
  globalForDB.inMemoryDB = dbFallback;
}

// DB Wrapper methods that switch transparently between real Supabase and local mock memory
export const db = {
  async getAnalyses(userId?: string | null): Promise<AnalysisRecord[]> {
    if (supabase) {
      try {
        let query = supabase.from('analyses').select('*');
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as AnalysisRecord[];
      } catch (err) {
        console.error('Supabase getAnalyses error, falling back to mock database:', err);
        return dbFallback.getAnalyses(userId);
      }
    }
    return dbFallback.getAnalyses(userId);
  },

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('analyses').select('*').eq('id', id).single();
        if (error) throw error;
        return data as AnalysisRecord;
      } catch (err) {
        console.error(`Supabase getAnalysisById(${id}) error, falling back to mock database:`, err);
        return dbFallback.getAnalysisById(id);
      }
    }
    return dbFallback.getAnalysisById(id);
  },

  async createAnalysis(data: Omit<AnalysisRecord, 'id' | 'created_at'>): Promise<AnalysisRecord> {
    if (supabase) {
      try {
        const { data: record, error } = await supabase.from('analyses').insert([data]).select().single();
        if (error) throw error;
        return record as AnalysisRecord;
      } catch (err) {
        console.error('Supabase createAnalysis error, falling back to mock database:', err);
        return dbFallback.createAnalysis(data);
      }
    }
    return dbFallback.createAnalysis(data);
  },

  async createComparison(data: Omit<ComparisonRecord, 'id' | 'created_at'>): Promise<ComparisonRecord> {
    if (supabase) {
      try {
        const { data: record, error } = await supabase.from('comparisons').insert([data]).select().single();
        if (error) throw error;
        return record as ComparisonRecord;
      } catch (err) {
        console.error('Supabase createComparison error, falling back to mock database:', err);
        return dbFallback.createComparison(data);
      }
    }
    return dbFallback.createComparison(data);
  }
};
