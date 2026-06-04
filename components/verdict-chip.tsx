import React from 'react';

interface VerdictChipProps {
  type: 'attack_risk' | 'confidence';
  value: 'low' | 'medium' | 'high';
}

export function VerdictChip({ type, value }: VerdictChipProps) {
  const isRisk = type === 'attack_risk';
  
  let bg = '';
  let border = '';
  let text = '';
  
  if (isRisk) {
    if (value === 'high') {
      bg = 'bg-red-950/40';
      border = 'border-red-900/50';
      text = 'text-red-400';
    } else if (value === 'medium') {
      bg = 'bg-amber-950/40';
      border = 'border-amber-900/50';
      text = 'text-amber-400';
    } else {
      bg = 'bg-emerald-950/40';
      border = 'border-emerald-900/50';
      text = 'text-emerald-400';
    }
  } else {
    // Confidence settings
    if (value === 'high') {
      bg = 'bg-zinc-800/40';
      border = 'border-zinc-700/50';
      text = 'text-zinc-200';
    } else if (value === 'medium') {
      bg = 'bg-zinc-900/40';
      border = 'border-zinc-800/50';
      text = 'text-zinc-400';
    } else {
      bg = 'bg-zinc-950/60';
      border = 'border-zinc-900/50';
      text = 'text-zinc-500';
    }
  }

  const label = isRisk ? `Attack Risk: ${value}` : `Confidence: ${value}`;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border uppercase tracking-wider ${bg} ${border} ${text}`}>
      {label}
    </span>
  );
}
