import React from 'react';
import { CheckCircle2, Bookmark, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { AnalysisRecord } from '@/types/analysis';

interface CompareViewProps {
  analysisA: AnalysisRecord;
  analysisB: AnalysisRecord;
  winnerId: string;
  summary: string;
}

export function CompareView({ analysisA, analysisB, winnerId, summary }: CompareViewProps) {
  const getYear = (dateStr?: string | null) => {
    return dateStr ? new Date(dateStr).getFullYear() : 'N/A';
  };

  const getAuthorDisplay = (item: AnalysisRecord) => {
    return `${item.author_name || 'Unknown Author'} (${getYear(item.published_at)})`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-emerald-400';
    if (score >= 5.0) return 'text-amber-400';
    return 'text-red-400';
  };

  // Row comparison indicator helper
  const renderCompareRow = (
    label: string,
    valA: number,
    valB: number
  ) => {
    const isAWinner = valA > valB;
    const isBWinner = valB > valA;
    const isTied = valA === valB;

    return (
      <tr className="border-b border-zinc-800 text-sm">
        <td className="py-4 font-medium text-zinc-400 text-left">{label}</td>
        <td className={`py-4 font-mono font-bold text-center ${getScoreColor(valA)} ${isAWinner ? 'bg-emerald-950/10' : ''}`}>
          {valA.toFixed(1)}
          {isAWinner && <span className="ml-1 text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider">[Better]</span>}
        </td>
        <td className={`py-4 font-mono font-bold text-center ${getScoreColor(valB)} ${isBWinner ? 'bg-emerald-950/10' : ''}`}>
          {valB.toFixed(1)}
          {isBWinner && <span className="ml-1 text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider">[Better]</span>}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Cards Header Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A */}
        <div className={`glass-card p-5 rounded-lg relative ${
          winnerId === analysisA.id ? 'border-emerald-700 bg-emerald-950/5' : ''
        }`}>
          {winnerId === analysisA.id && (
            <span className="absolute -top-3 left-4 inline-flex items-center gap-1 bg-emerald-700 text-emerald-100 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              <Bookmark className="h-3 w-3 fill-current" /> Recommended Pick
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">// CARD A</span>
          <h3 className="font-mono font-bold text-sm text-zinc-300 mt-1">{getAuthorDisplay(analysisA)}</h3>
          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 italic">&quot;{analysisA.claim_text}&quot;</p>
          <div className="flex items-center gap-2 mt-4 font-mono">
            <span className="text-[10px] text-zinc-500">READINESS</span>
            <span className={`text-xl font-bold ${getScoreColor(analysisA.overall_score)}`}>{analysisA.overall_score.toFixed(1)}</span>
          </div>
        </div>

        {/* Card B */}
        <div className={`glass-card p-5 rounded-lg relative ${
          winnerId === analysisB.id ? 'border-emerald-700 bg-emerald-950/5' : ''
        }`}>
          {winnerId === analysisB.id && (
            <span className="absolute -top-3 left-4 inline-flex items-center gap-1 bg-emerald-700 text-emerald-100 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              <Bookmark className="h-3 w-3 fill-current" /> Recommended Pick
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">// CARD B</span>
          <h3 className="font-mono font-bold text-sm text-zinc-300 mt-1">{getAuthorDisplay(analysisB)}</h3>
          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 italic">&quot;{analysisB.claim_text}&quot;</p>
          <div className="flex items-center gap-2 mt-4 font-mono">
            <span className="text-[10px] text-zinc-500">READINESS</span>
            <span className={`text-xl font-bold ${getScoreColor(analysisB.overall_score)}`}>{analysisB.overall_score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Comparison summary card */}
      <div className="glass-card rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <ArrowRightLeft className="h-4 w-4 text-zinc-400" />
          <span>[DECISION LOGIC COMPARISON SUMMARY]</span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed font-sans bg-zinc-900/50 p-4 rounded border border-zinc-900 border-l-2 border-l-emerald-600">
          {summary}
        </p>
      </div>

      {/* Structured Rubric Table */}
      <div className="glass-card rounded-lg p-5">
        <h4 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase pb-2 border-b border-[var(--border)]">
          // ALIGNED RUBRIC COMPARISON
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-mono text-[var(--muted-foreground)] uppercase">
                <th className="py-3 text-left font-semibold">Evaluation Rubric</th>
                <th className="py-3 text-center font-semibold w-1/3">Card A Scores</th>
                <th className="py-3 text-center font-semibold w-1/3">Card B Scores</th>
              </tr>
            </thead>
            <tbody>
              {renderCompareRow('Source Credibility (25%)', analysisA.source_credibility, analysisB.source_credibility)}
              {renderCompareRow('Claim Fit (30%)', analysisA.claim_fit, analysisB.claim_fit)}
              {renderCompareRow('Recency Fit (15%)', analysisA.recency_fit, analysisB.recency_fit)}
              {renderCompareRow('Specificity (15%)', analysisA.specificity, analysisB.specificity)}
              {renderCompareRow('Quote Integrity (15%)', analysisA.quote_integrity, analysisB.quote_integrity)}
              
              {/* Attack Risk Row */}
              <tr className="border-b border-zinc-800 text-sm">
                <td className="py-4 font-medium text-zinc-400 text-left">Attack Risk Profile</td>
                <td className="py-4 text-center font-mono font-bold">
                  <span className={`uppercase text-[11px] font-bold ${
                    analysisA.attack_risk === 'high' ? 'text-red-400' : analysisA.attack_risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {analysisA.attack_risk}
                  </span>
                </td>
                <td className="py-4 text-center font-mono font-bold">
                  <span className={`uppercase text-[11px] font-bold ${
                    analysisB.attack_risk === 'high' ? 'text-red-400' : analysisB.attack_risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {analysisB.attack_risk}
                  </span>
                </td>
              </tr>

              {/* Confidence level row */}
              <tr className="border-b border-zinc-800 text-sm last:border-0">
                <td className="py-4 font-medium text-zinc-400 text-left">Evaluator Confidence</td>
                <td className="py-4 text-center font-mono text-zinc-300">
                  <span className="uppercase text-xs">{analysisA.confidence_level}</span>
                </td>
                <td className="py-4 text-center font-mono text-zinc-300">
                  <span className="uppercase text-xs">{analysisB.confidence_level}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
