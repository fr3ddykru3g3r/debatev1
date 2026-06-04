'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Scale } from 'lucide-react';
import { CompareView } from '@/components/compare-view';
import { AnalysisRecord } from '@/types/analysis';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const idA = searchParams.get('a');
  const idB = searchParams.get('b');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    if (!idA || !idB) {
      setError('Please select two cards from the History tab to run side-by-side comparison.');
      setLoading(false);
      return;
    }

    const runComparison = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisAId: idA,
            analysisBId: idB,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to compare the selected cards.');
        }

        const data = await response.json();
        setComparison(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error running comparison analysis.');
      } finally {
        setLoading(false);
      }
    };

    runComparison();
  }, [idA, idB]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <Link href="/history" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to History
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Scale className="h-6 w-6 text-zinc-400" /> Side-by-Side Comparison
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider space-y-3">
          <div className="relative w-8 h-8 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin"></div>
          </div>
          <p>Analyzing comparative warrants and checking tie-breaker rubrics...</p>
        </div>
      ) : error ? (
        <div className="p-5 border border-red-900/40 bg-red-950/20 text-red-400 rounded-lg space-y-3">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => router.push('/history')}
            className="text-xs font-mono bg-zinc-800 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded transition-colors text-zinc-200 cursor-pointer"
          >
            Go to History
          </button>
        </div>
      ) : (
        <CompareView
          analysisA={comparison.analysisA}
          analysisB={comparison.analysisB}
          winnerId={comparison.winnerId}
          summary={comparison.summary}
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
        Initializing comparison layout...
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
