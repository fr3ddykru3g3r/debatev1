'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, Scale, ArrowRight, Layers, FileText } from 'lucide-react';
import { VerdictChip } from './verdict-chip';
import { AnalysisRecord } from '@/types/analysis';

interface HistoryListProps {
  analyses: AnalysisRecord[];
  onSelectForCompare: (ids: string[]) => void;
  onSelectForView: (analysis: AnalysisRecord) => void;
  selectedCompareIds: string[];
}

export function HistoryList({
  analyses,
  onSelectForCompare,
  onSelectForView,
  selectedCompareIds,
}: HistoryListProps) {
  const [list, setList] = useState<AnalysisRecord[]>(analyses);

  const handleSelectCompare = (id: string) => {
    let updated = [...selectedCompareIds];
    if (updated.includes(id)) {
      updated = updated.filter(item => item !== id);
    } else {
      if (updated.length >= 2) {
        // limit to 2
        updated.shift();
      }
      updated.push(id);
    }
    onSelectForCompare(updated);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // For prototype, we just remove it locally from state.
    // In production, this can call a delete API.
    setList(prev => prev.filter(item => item.id !== id));
  };

  if (list.length === 0) {
    return (
      <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center text-zinc-500 space-y-3">
        <FileText className="h-8 w-8 mx-auto text-zinc-600" />
        <p className="text-sm">No analysis history found. Paste evidence on the home page to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
        <span className="text-xs font-mono font-bold tracking-tight text-zinc-400">
          // RECENT CARDS ({list.length})
        </span>
        {selectedCompareIds.length > 0 && (
          <span className="text-[11px] font-mono text-zinc-400">
            Selected: <strong className="text-zinc-200">{selectedCompareIds.length}/2</strong> for Compare
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {list.map((item) => {
          const isSelected = selectedCompareIds.includes(item.id);
          const year = item.published_at ? new Date(item.published_at).getFullYear() : 'N/A';
          const title = item.author_name ? `${item.author_name} (${year})` : `Analysis: ${item.id.substring(0, 8)}`;
          
          return (
            <div
              key={item.id}
              onClick={() => onSelectForView(item)}
              className={`p-4 bg-zinc-950/20 border rounded-lg flex items-center justify-between gap-4 hover:border-zinc-700 transition-all cursor-pointer group select-none ${
                isSelected ? 'border-zinc-500 bg-zinc-900/10' : 'border-[var(--border)]'
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    {title}
                  </span>
                  <VerdictChip type="attack_risk" value={item.attack_risk} />
                </div>
                
                <h4 className="text-sm font-medium text-zinc-100 truncate">
                  Tag: &quot;{item.claim_text}&quot;
                </h4>

                <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  {item.topic_label && (
                    <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      {item.topic_label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Compare Checkbox Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCompare(item.id);
                  }}
                  className={`flex items-center justify-center h-8 w-8 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                  title="Select for Side-by-Side Comparison"
                >
                  <Scale className="h-4 w-4" />
                </button>

                {/* Score badge */}
                <div className="text-right font-mono">
                  <div className="text-xs text-zinc-500">Readiness</div>
                  <div className="text-base font-bold text-zinc-200">{item.overall_score.toFixed(1)}</div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="h-8 w-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
