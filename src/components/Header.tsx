import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types/music';
import {
  Search,
  Upload,
  Link,
  X,
  Loader2,
  TrendingUp,
  Sparkles,
  Music,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  onSearchSubmit: (query: string) => void;
  activeFilter: 'all' | 'youtube' | 'local';
  setActiveFilter: (filter: 'all' | 'youtube' | 'local') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchSubmit,
  activeFilter,
  setActiveFilter,
  activeTab,
  setActiveTab,
}) => {
  const { setIsImportModalOpen, playTrack } = useAudio();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-complete suggestions debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {}
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    const target = q.trim();
    if (!target) return;
    setShowSuggestions(false);
    setActiveTab('search');
    onSearchSubmit(target);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* Search Input Bar with Suggestions */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search any YouTube song, artist, album, or paste a video link..."
            className="w-full h-10 pl-10 pr-9 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 flex flex-col gap-0.5 animate-in fade-in duration-150">
            <span className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              YouTube Search Suggestions
            </span>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors group"
              >
                <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                <span className="flex-1 truncate">{item}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs & Import CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800/80 rounded-lg">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Music
          </button>
          <button
            onClick={() => setActiveFilter('youtube')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'youtube'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => setActiveFilter('local')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'local'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Local Files
          </button>
        </div>

        {/* Import Local Files button */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20 active:scale-98"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import Local</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>
    </header>
  );
};
