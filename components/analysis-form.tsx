'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';
import { AnalysisRequest } from '@/types/analysis';

interface AnalysisFormProps {
  onSubmit: (data: AnalysisRequest) => void;
  isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [claimText, setClaimText] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  
  // Optional metadata inputs
  const [showMetadata, setShowMetadata] = useState(false);
  const [sourceTitle, setSourceTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publicationName, setPublicationName] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [topicLabel, setTopicLabel] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!claimText.trim()) {
      setError('Please enter a claim tag.');
      return;
    }
    if (!evidenceText.trim()) {
      setError('Please paste the evidence text.');
      return;
    }

    const payload: AnalysisRequest = {
      claimText: claimText.trim(),
      evidenceText: evidenceText.trim(),
      sourceTitle: sourceTitle.trim() || undefined,
      authorName: authorName.trim() || undefined,
      publicationName: publicationName.trim() || undefined,
      publishedAt: publishedAt.trim() || undefined,
      topicLabel: topicLabel.trim() || undefined,
    };

    onSubmit(payload);
  };

  const handleFillSample = (sampleNum: number) => {
    setError('');
    if (sampleNum === 1) {
      setClaimText('Carbon border adjustments reduce carbon leakage in the medium term.');
      setEvidenceText(
        'A 2024 OECD analysis finds that carbon border mechanisms can reduce leakage risk in emissions-intensive trade-exposed sectors, though effects vary by sector design and partner responses.'
      );
      setSourceTitle('Carbon Border Leakage Report');
      setAuthorName('OECD Secretariat');
      setPublicationName('OECD Publishing');
      setPublishedAt('2024-03-15');
      setTopicLabel('Economics');
    } else if (sampleNum === 2) {
      setClaimText('Social media causes democratic collapse.');
      setEvidenceText(
        'Researchers find an association between social-media misinformation exposure and lower trust in public institutions across several surveyed democracies.'
      );
      setSourceTitle('Media and Public Trust Index');
      setAuthorName('Stanford Research Group');
      setPublicationName('Journal of Communication');
      setPublishedAt('2023-09-10');
      setTopicLabel('Politics');
    } else if (sampleNum === 3) {
      setClaimText('This policy immediately solves grid instability.');
      setEvidenceText(
        'A 2019 think tank report suggests battery deployments can improve resilience under some peak-demand conditions.'
      );
      setSourceTitle('Grid Performance Brief');
      setAuthorName('Energy Institute');
      setPublicationName('Policy Review');
      setPublishedAt('2019-06-01');
      setTopicLabel('Infrastructure');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-950/40 p-5 rounded-lg border border-[var(--border)] text-left">
      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
        <h2 className="text-sm font-mono font-bold tracking-tight text-zinc-300 uppercase">// EVIDENCE INPUT</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleFillSample(1)}
            className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Sample 1
          </button>
          <button
            type="button"
            onClick={() => handleFillSample(2)}
            className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Sample 2
          </button>
          <button
            type="button"
            onClick={() => handleFillSample(3)}
            className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
          >
            Sample 3
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Claim / Tag Area */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-zinc-400">
          <label htmlFor="claimText">Proposed Tag / Claim</label>
          <span className="font-mono">{claimText.length}/500</span>
        </div>
        <textarea
          id="claimText"
          rows={2}
          value={claimText}
          onChange={(e) => setClaimText(e.target.value.substring(0, 500))}
          placeholder="Enter the argument tag or claim you want the evidence to support..."
          className="w-full bg-zinc-900 border border-[var(--border)] rounded p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200 placeholder-zinc-600 resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Evidence Area */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-zinc-400">
          <label htmlFor="evidenceText">Evidence Text (Card Body)</label>
          <span className="font-mono">{evidenceText.length}/8000</span>
        </div>
        <textarea
          id="evidenceText"
          rows={6}
          value={evidenceText}
          onChange={(e) => setEvidenceText(e.target.value.substring(0, 8000))}
          placeholder="Paste the evidence card here. (You can include a citation header at the top - CutBase will attempt to extract author and date automatically)..."
          className="w-full bg-zinc-900 border border-[var(--border)] rounded p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200 placeholder-zinc-600 font-sans"
          disabled={isLoading}
        />
      </div>

      {/* Optional Metadata Accordion */}
      <div className="border-t border-[var(--border)] pt-2">
        <button
          type="button"
          onClick={() => setShowMetadata(!showMetadata)}
          className="flex items-center justify-between w-full py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 text-left select-none cursor-pointer"
        >
          <span>[OPTIONAL METADATA DISCLOSURE]</span>
          {showMetadata ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
        </button>

        {showMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 pb-2">
            <div className="space-y-1">
              <label htmlFor="authorName" className="text-[11px] text-zinc-500 font-medium">Source Author(s)</label>
              <input
                id="authorName"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Krugman"
                className="w-full bg-zinc-900 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="publishedAt" className="text-[11px] text-zinc-500 font-medium">Published Date (YYYY-MM-DD)</label>
              <input
                id="publishedAt"
                type="text"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                placeholder="e.g. 2024-06-01"
                className="w-full bg-zinc-900 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200 font-mono"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sourceTitle" className="text-[11px] text-zinc-500 font-medium">Document / Article Title</label>
              <input
                id="sourceTitle"
                type="text"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g. Climate Mitigation Costs"
                className="w-full bg-zinc-900 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="publicationName" className="text-[11px] text-zinc-500 font-medium">Publication / Venue</label>
                <input
                  id="publicationName"
                  type="text"
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  placeholder="e.g. New York Times"
                  className="w-full bg-zinc-900 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="topicLabel" className="text-[11px] text-zinc-500 font-medium">Topic Tag</label>
                <input
                  id="topicLabel"
                  type="text"
                  value={topicLabel}
                  onChange={(e) => setTopicLabel(e.target.value)}
                  placeholder="e.g. Economy"
                  className="w-full bg-zinc-900 border border-[var(--border)] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ring)] text-zinc-200"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors font-mono font-bold text-xs tracking-wider uppercase rounded flex items-center justify-center gap-2 cursor-pointer select-none"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isLoading ? 'Running Argument-Quality Pipeline...' : 'Evaluate Evidence Quality'}
      </button>
    </form>
  );
}
