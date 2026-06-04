'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, ChevronRight, Scale } from 'lucide-react';
import Link from 'next/link';
import { AnalysisForm } from '@/components/analysis-form';
import { AnalysisResult } from '@/components/analysis-result';
import { AnalysisRecord, AnalysisRequest } from '@/types/analysis';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Sign in anonymously on mount (Supabase or device fallback token)
  useEffect(() => {
    const initUserSession = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUserId(session.user.id);
            localStorage.setItem('cutbase_device_user_id', session.user.id);
          } else {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            if (data.user) {
              setUserId(data.user.id);
              localStorage.setItem('cutbase_device_user_id', data.user.id);
            }
          }
        } else {
          // Generate a stable local UUID for local mock run persistence
          let localId = localStorage.getItem('cutbase_device_user_id');
          if (!localId) {
            localId = crypto.randomUUID();
            localStorage.setItem('cutbase_device_user_id', localId);
          }
          setUserId(localId);
        }
      } catch (err) {
        console.warn('Session initialization warning, using offline mock identity:', err);
        let fallbackId = localStorage.getItem('cutbase_device_user_id') || 'local-demo-user-id';
        setUserId(fallbackId);
      }
    };
    initUserSession();
  }, []);

  const handleAnalyze = async (request: AnalysisRequest) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          ...request,
          userId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to complete card analysis.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during evidence assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title / Pitch */}
      <div className="text-left space-y-2 border-l-2 border-zinc-200 pl-4 py-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          CutBase Evidence Analysis
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
          Competitive debate-native argument-quality engine. Paste your claim tag and card body 
          to evaluate claim-fit, source credibility, and identify attack vulnerability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <AnalysisForm onSubmit={handleAnalyze} isLoading={isLoading} />
          
          <div className="p-4 bg-zinc-950/20 border border-[var(--border)] rounded-lg text-left text-xs space-y-2.5">
            <span className="font-mono text-zinc-500 font-bold block uppercase tracking-wider">// SCORED DIMENSIONS</span>
            <ul className="space-y-1.5 text-zinc-400 font-sans">
              <li className="flex justify-between">
                <span>• Claim Fit</span>
                <span className="font-mono text-zinc-500 font-bold">30%</span>
              </li>
              <li className="flex justify-between">
                <span>• Source Credibility</span>
                <span className="font-mono text-zinc-500 font-bold">25%</span>
              </li>
              <li className="flex justify-between">
                <span>• Recency Fit</span>
                <span className="font-mono text-zinc-500 font-bold">15%</span>
              </li>
              <li className="flex justify-between">
                <span>• Specificity</span>
                <span className="font-mono text-zinc-500 font-bold">15%</span>
              </li>
              <li className="flex justify-between">
                <span>• Quote Integrity</span>
                <span className="font-mono text-zinc-500 font-bold">15%</span>
              </li>
            </ul>
            <p className="text-[10px] text-zinc-500 italic pt-1 leading-relaxed border-t border-zinc-900">
              * A penalty is applied to the overall readiness score for medium or high attack risk.
            </p>
          </div>
        </div>

        {/* Right Output Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading && (
            <div className="border border-[var(--border)] rounded-lg p-16 text-center space-y-4 bg-zinc-950/10">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-300">Evaluating Card Metrics</p>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  Running parser heuristic pre-checks and scoring debate rubric parameters against target claim...
                </p>
              </div>
            </div>
          )}

          {!isLoading && !result && (
            <div className="border border-dashed border-zinc-800 rounded-lg p-16 text-center text-zinc-500 space-y-3 bg-zinc-950/5">
              <Sparkles className="h-8 w-8 mx-auto text-zinc-700" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-400">Waiting for Evidence</p>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                  Paste a claim tag and an evidence block to trigger structured debate-evidence evaluation.
                </p>
              </div>
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">// REPORT CARD READY</span>
                <Link href="/history" className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
                  View History <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <AnalysisResult result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
