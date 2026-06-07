'use client';

import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react';

interface OpenAlexWork {
  title: string;
  author: string;
  year: number;
  journal: string;
  url: string;
}

const SAMPLE_TOPICS = [
  'Carbon pricing emissions leakage',
  'Autonomous AI weapons governance',
  'Universal Basic Income labor supply',
  'Nuclear deterrence cyber vulnerability',
  'Hegemonic stability transition theory'
];

export default function SourcesPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<OpenAlexWork[]>([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const response = await fetch(`/api/suggest-sources?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      } else {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to search academic literature.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching sources.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    handleSearch(sample);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-left">
      {/* Title / Description */}
      <div className="space-y-2 border-l-2 border-zinc-200 pl-4 py-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          Academic Backing Explorer
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
          Search OpenAlex's index of over 250 million scientific papers. Find authoritative peer-reviewed 
          evidence to validate or challenge debate arguments instead of standard search engine noise.
        </p>
      </div>

      {/* Search Bar Panel */}
      <div className="bg-zinc-950/40 p-6 rounded-lg border border-[var(--border)] space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a claim topic, theory, or argument..."
              className="w-full bg-zinc-900 border border-[var(--border)] rounded px-3 py-2.5 pl-10 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
              disabled={loading}
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-mono font-bold text-xs tracking-wider uppercase rounded transition-colors flex items-center gap-2 cursor-pointer select-none"
          >
            {loading ? 'Searching...' : 'Find Evidence'}
          </button>
        </form>

        {/* Quick Sample Topics */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
            // SUGGESTED TOPICS
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(topic)}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="space-y-4">
        {loading && (
          <div className="border border-[var(--border)] rounded-lg p-16 text-center space-y-4 bg-zinc-950/10">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
              <div className="absolute inset-0 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-300">
                Retrieving Peer-Reviewed Matches
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Polling the OpenAlex academic database polite pool for title, author, and citation details...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="border border-dashed border-zinc-800 rounded-lg p-16 text-center text-zinc-500 space-y-3 bg-zinc-950/5">
            <BookOpen className="h-8 w-8 mx-auto text-zinc-700" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-400">Literature Search Ready</p>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                Type a debate claim above or select a preset topic to retrieve matching scholarly publications.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && hasSearched && sources.length === 0 && (
          <div className="border border-zinc-800 rounded-lg p-12 text-center text-zinc-500 bg-zinc-950/10">
            <p className="text-sm font-medium text-zinc-400">No results found</p>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto mt-1">
              Could not find any matching academic papers for "{query}". Try broadening your search query.
            </p>
          </div>
        )}

        {!loading && !error && sources.length > 0 && (
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase block pl-1">
              // TOP SCHOLARLY SEARCH RESULTS
            </span>
            <div className="bg-zinc-950/20 border border-[var(--border)] rounded-lg divide-y divide-zinc-900/50">
              {sources.map((src, idx) => (
                <div key={idx} className="p-5 space-y-2 group hover:bg-zinc-950/40 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-100 hover:text-zinc-200 flex items-start gap-1 font-sans leading-relaxed text-sm md:text-base"
                    >
                      {src.title}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                    <span className="text-zinc-300">By {src.author}</span>
                    <span>•</span>
                    <span>{src.journal}</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-400">({src.year})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
