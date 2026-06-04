'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HistoryList } from '@/components/history-list';
import { AnalysisResult } from '@/components/analysis-result';
import { AnalysisRecord } from '@/types/analysis';

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [activeViewAnalysis, setActiveViewAnalysis] = useState<AnalysisRecord | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const deviceId = localStorage.getItem('cutbase_device_user_id') || '';
      const response = await fetch(`/api/analyses?userId=${deviceId}`);
      if (!response.ok) throw new Error('Failed to fetch evaluation history.');
      const data = await response.json();
      setAnalyses(data);
      if (data.length > 0 && !activeViewAnalysis) {
        setActiveViewAnalysis(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCompareClick = () => {
    if (selectedCompareIds.length !== 2) return;
    router.push(`/compare?a=${selectedCompareIds[0]}&b=${selectedCompareIds[1]}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <Link href="/" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Analyzer
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Evaluation History</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="p-2 border border-zinc-800 rounded hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            title="Refresh History"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {selectedCompareIds.length === 2 && (
            <button
              onClick={handleCompareClick}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-2 cursor-pointer select-none transition-colors border border-emerald-500/50"
            >
              <Scale className="h-4 w-4" /> Compare Selected Cards
            </button>
          )}
        </div>
      </div>

      {/* User-Testing Stats Dashboard */}
      {!loading && !error && analyses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono">
          <div className="space-y-1">
            <span className="text-zinc-500 block uppercase font-bold tracking-wider">// ANALYSES RUN</span>
            <span className="text-lg font-bold text-zinc-100">{analyses.length} Cards</span>
          </div>
          <div className="space-y-1 border-l border-zinc-800 pl-4">
            <span className="text-zinc-500 block uppercase font-bold tracking-wider">// QA WRONG OUTPUT FLAGS</span>
            <span className={`text-lg font-bold ${analyses.filter(a => a.flagged).length > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {analyses.filter(a => a.flagged).length} flagged
            </span>
          </div>
          <div className="space-y-1 border-l border-zinc-800 pl-4">
            <span className="text-zinc-500 block uppercase font-bold tracking-wider">// AVERAGE READINESS</span>
            <span className="text-lg font-bold text-zinc-100">
              {(analyses.reduce((acc, cur) => acc + Number(cur.overall_score), 0) / analyses.length).toFixed(1)}/10.0
            </span>
          </div>
          <div className="space-y-1 border-l border-zinc-800 pl-4">
            <span className="text-zinc-500 block uppercase font-bold tracking-wider">// LATENCY SPEED STATUS</span>
            <span className="text-lg font-bold text-emerald-400 uppercase tracking-wide">
              Fast NIM Active
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
          Loading evaluation archive...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 text-sm rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - History List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <HistoryList
              analyses={analyses}
              onSelectForCompare={setSelectedCompareIds}
              onSelectForView={setActiveViewAnalysis}
              selectedCompareIds={selectedCompareIds}
            />
          </div>

          {/* Right Column - Active View Detail (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {activeViewAnalysis ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase">// FULL DIAGNOSTIC REPORT</span>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {activeViewAnalysis.id}</span>
                </div>
                <AnalysisResult result={activeViewAnalysis} />
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 rounded-lg p-16 text-center text-zinc-500 space-y-3 bg-zinc-950/5">
                <FileText className="h-8 w-8 mx-auto text-zinc-700" />
                <p className="text-sm">Select a card from the history to view full diagnostic report details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
