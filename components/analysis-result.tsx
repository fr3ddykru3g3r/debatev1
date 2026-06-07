'use client';

import React, { useState, useEffect } from 'react';
import { Award, Copy, Check, Info, AlertTriangle, Lightbulb, Bookmark, BookOpen, ExternalLink, Search } from 'lucide-react';
import { ScoreRow } from './score-row';
import { VerdictChip } from './verdict-chip';
import { AnalysisRecord } from '@/types/analysis';

interface AnalysisResultProps {
  result: AnalysisRecord;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(result.suggested_tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const citationYear = result.published_at ? new Date(result.published_at).getFullYear() : 'N/A';
    const citationDisplay = `${result.author_name || 'Unknown Author'} (${citationYear})`;
    const formatted = `Tag: ${result.suggested_tag}\nVerdict: ${result.one_line_verdict}\nSource: ${citationDisplay}`;
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };


  // Score color formatting
  let scoreColor = 'text-red-400';
  let scoreBg = 'border-red-900/50 bg-red-950/20';
  
  if (result.overall_score >= 7.5) {
    scoreColor = 'text-emerald-400';
    scoreBg = 'border-emerald-900/50 bg-emerald-950/20';
  } else if (result.overall_score >= 5.0) {
    scoreColor = 'text-amber-400';
    scoreBg = 'border-amber-900/50 bg-amber-950/20';
  }

  const citationYear = result.published_at ? new Date(result.published_at).getFullYear() : 'N/A';
  const citationDisplay = `${result.author_name || 'Unknown Author'} (${citationYear})`;

  const sourceIntegrity = ((Number(result.source_credibility) * 25) + (Number(result.recency_fit) * 15)) / 40;
  const logicalFit = ((Number(result.claim_fit) * 30) + (Number(result.specificity) * 15) + (Number(result.quote_integrity) * 15)) / 60;

  return (
    <div className="space-y-6 text-left">
      {/* Overview Card */}
      <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
              // EVALUATED CARD: {citationDisplay}
            </span>
            <h3 className="text-base font-bold text-zinc-100 leading-snug">
              {result.one_line_verdict}
            </h3>
            <div className="flex flex-wrap gap-2 pt-1.5">
              <VerdictChip type="attack_risk" value={result.attack_risk} />
              <VerdictChip type="confidence" value={result.confidence_level} />
            </div>
            
            {/* Grouped Scores Breakdown */}
            <div className="flex gap-4 pt-3 text-[11px] font-mono">
              <div>
                <span className="text-zinc-500 mr-1.5">SOURCE AUTHORITY:</span>
                <span className="text-zinc-300 font-bold">{sourceIntegrity.toFixed(1)}/10</span>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="text-zinc-500 mr-1.5">ARGUMENTATIVE FIT:</span>
                <span className="text-zinc-300 font-bold">{logicalFit.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          <div className={`shrink-0 border rounded-lg px-4 py-3 flex flex-col items-center justify-center text-center ${scoreBg}`}>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
              Readiness Score
            </span>
            <span className={`text-3xl font-mono font-bold ${scoreColor}`}>
              {result.overall_score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Quick Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Award className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[var(--muted-foreground)] block">STRONGEST ATTRIBUTE</span>
              <span className="font-medium text-zinc-200">{result.strongest_attribute}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[var(--muted-foreground)] block">BIGGEST WEAKNESS</span>
              <span className="font-medium text-zinc-200">{result.biggest_weakness}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Debate Tag Repair */}
      <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>[SUGGESTED DEBATE TAG REPAIR]</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyTag}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-2 py-1 rounded transition-colors cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied Tag</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Tag</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-2 py-1 rounded transition-colors cursor-pointer select-none"
            >
              {copiedAll ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied Output</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Tag & Verdict</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-zinc-100 bg-zinc-900/50 p-3 rounded border border-zinc-900 border-l-2 border-l-yellow-600 leading-relaxed">
          {result.suggested_tag}
        </p>
      </div>

      {/* Structured Rubric Scores */}
      <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-5">
        <h4 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase pb-2 border-b border-[var(--border)]">
          // RUBRIC METRICS BREAKDOWN
        </h4>
        <div className="divide-y divide-[var(--border)]">
          <ScoreRow 
            label="Source Credibility (25%)" 
            score={result.source_credibility} 
            explanation={result.explanations.source_credibility}
          />
          <ScoreRow 
            label="Claim Fit (30%)" 
            score={result.claim_fit} 
            explanation={result.explanations.claim_fit}
          />
          <ScoreRow 
            label="Recency Fit (15%)" 
            score={result.recency_fit} 
            explanation={result.explanations.recency_fit}
          />
          <ScoreRow 
            label="Specificity (15%)" 
            score={result.specificity} 
            explanation={result.explanations.specificity}
          />
          <ScoreRow 
            label="Quote Integrity (15%)" 
            score={result.quote_integrity} 
            explanation={result.explanations.quote_integrity}
          />
        </div>
      </div>

      {/* Suggested Best Use */}
      <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-zinc-400" />
          <span className="font-mono text-[var(--muted-foreground)]">RECOMMENDED BEST USE CASE:</span>
        </div>
        <span className="font-mono font-bold text-zinc-200 border border-zinc-800 px-2.5 py-1 rounded bg-zinc-900/50 uppercase tracking-wider">
          {result.suggested_best_use}
        </span>
      </div>

      {/* Collapsible Original Evidence */}
      <CollapsibleEvidence text={result.evidence_text || ''} sourceUrl={result.source_url} />

      {/* Authoritative Academic Sources */}
      <SuggestedSources query={result.suggested_tag} />

      {/* Disagreement / QA Flag Capture */}
      <FeedbackPanel analysisId={result.id} initiallyFlagged={result.flagged || false} />
    </div>
  );
}

function CollapsibleEvidence({ text, sourceUrl }: { text: string; sourceUrl?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-4 text-xs text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-mono text-[var(--muted-foreground)] hover:text-zinc-200 select-none cursor-pointer"
      >
        <span>{sourceUrl ? '[VIEW EXTRACTED WEB CONTENT]' : '[VIEW ORIGINAL EVIDENCE TEXT]'}</span>
        <span>{isOpen ? '[-]' : '[+]'}</span>
      </button>
      {isOpen && (
        <div className="mt-3 border-t border-zinc-900 pt-3 space-y-2">
          {sourceUrl && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 mb-2">
              <ExternalLink className="h-3 w-3 text-zinc-500" />
              <span>Source Link:</span>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-200 underline truncate max-w-md">
                {sourceUrl}
              </a>
            </div>
          )}
          <p className="text-zinc-300 font-serif whitespace-pre-wrap leading-relaxed">
            {text || 'No text extracted.'}
          </p>
        </div>
      )}
    </div>
  );
}

function FeedbackPanel({ analysisId, initiallyFlagged }: { analysisId: string; initiallyFlagged: boolean }) {
  const [flagged, setFlagged] = useState(initiallyFlagged);
  const [showInput, setShowInput] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/analyses/${analysisId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (response.ok) {
        setFlagged(true);
        setShowInput(false);
      } else {
        alert('Failed to save feedback flags.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (flagged) {
    return (
      <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded text-xs text-amber-300 font-mono text-center">
        [FLAGGED FOR QA REVIEW: EVALUATION FEEDBACK SENT]
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/10 border border-[var(--border)] rounded-lg p-4 space-y-3">
      {!showInput ? (
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-500">Disagree with this evaluation result?</span>
          <button
            onClick={() => setShowInput(true)}
            className="text-[11px] text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-900/50 px-2.5 py-1 rounded cursor-pointer transition-colors"
          >
            Flag Incorrect Assessment
          </button>
        </div>
      ) : (
        <form onSubmit={handleFlagSubmit} className="space-y-2">
          <label htmlFor="flagReason" className="block text-[11px] font-mono text-zinc-400">Describe what is incorrect (scoring bias, tag formatting, etc.)</label>
          <textarea
            id="flagReason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Claim fit is scored too low. The card specifies regional impacts which aligns exactly with our target claim..."
            className="w-full bg-zinc-900 border border-[var(--border)] rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-900/50 text-zinc-200"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="px-2 py-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 bg-amber-900/35 hover:bg-amber-900/50 border border-amber-900/50 text-amber-200 rounded cursor-pointer"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Sending...' : 'Submit QA Flag'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SuggestedSources({ query }: { query: string }) {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(query);

  const fetchSources = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/suggest-sources?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Error fetching academic sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchVal(query);
    fetchSources(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSources(searchVal);
  };

  return (
    <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg p-5 space-y-4 text-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900/40 pb-3">
        <div className="flex items-center gap-2 font-mono text-[var(--muted-foreground)]">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span>[AUTHORITATIVE ACADEMIC BACKUP SOURCES]</span>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search OpenAlex for backing literature..."
            className="w-full bg-zinc-900/50 border border-[var(--border)] rounded px-3 py-1.5 pl-8 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 bg-zinc-900 border border-[var(--border)] hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded transition-colors cursor-pointer select-none"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-zinc-500 font-mono italic animate-pulse">Searching OpenAlex database for supporting literature...</p>
      ) : sources.length === 0 ? (
        <p className="text-zinc-500 font-mono italic">No supporting academic papers found for this query.</p>
      ) : (
        <div className="space-y-3.5 pt-1">
          {sources.map((src, idx) => (
            <div key={idx} className="space-y-1 group">
              <a 
                href={src.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-zinc-100 hover:text-zinc-300 flex items-start gap-1 font-sans leading-relaxed"
              >
                {src.title}
                <ExternalLink className="h-3 w-3 shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span>By {src.author}</span>
                <span>•</span>
                <span>{src.journal} ({src.year})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
