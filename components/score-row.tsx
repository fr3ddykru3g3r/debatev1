import React from 'react';

interface ScoreRowProps {
  label: string;
  score: number;
  explanation?: string;
}

export function ScoreRow({ label, score, explanation }: ScoreRowProps) {
  // Determine color matching score value
  let barColor = 'bg-red-500/80';
  let textColor = 'text-red-400';
  
  if (score >= 7.5) {
    barColor = 'bg-emerald-500/80';
    textColor = 'text-emerald-400';
  } else if (score >= 5.0) {
    barColor = 'bg-amber-500/80';
    textColor = 'text-amber-400';
  }

  const percentage = Math.min(100, Math.max(0, score * 10));

  return (
    <div className="space-y-1.5 py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className={`font-mono font-bold ${textColor}`}>{score.toFixed(1)}/10.0</span>
      </div>
      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {explanation && (
        <p className="text-[12px] text-zinc-400 leading-relaxed pt-0.5">{explanation}</p>
      )}
    </div>
  );
}
