import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import {
  Search as SearchIcon,
  Loader2,
  Sparkles,
  Link,
  Flame,
  Radio,
  FileAudio,
} from 'lucide-react';

interface SearchViewProps {
  initialQuery?: string;
  activeFilter: 'all' | 'youtube' | 'local';
}

const POPULAR_QUERIES = [
  'Billie Eilish',
  'Coldplay',
  'The Weeknd',
  'Lofi Girl Beats',
  'Hans Zimmer Interstellar',
  'Daft Punk Random Access Memories',
  'Synthwave 80s Chill',
  'Acoustic Covers Relax',
  'Kendrick Lamar',
  'Miles Davis Kind of Blue',
];

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  activeFilter,
}) => {
  const { localTracks, playTrack } = useAudio();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.tracks || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Filter results
  const filteredResults = results.filter((track) => {
    if (activeFilter === 'youtube') return track.source === 'youtube';
    if (activeFilter === 'local') return track.source === 'local';
    return true;
  });

  // Also match local tracks if searching
  const matchingLocalTracks = searchQuery.trim()
    ? localTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const combinedResults =
    activeFilter === 'youtube'
      ? filteredResults
      : activeFilter === 'local'
      ? matchingLocalTracks
      : [...matchingLocalTracks, ...filteredResults];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube or paste a URL (e.g. youtube.com/watch?v=...)"
            className="w-full h-11 pl-11 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="px-5 h-11 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-xl transition-colors shadow-sm shadow-amber-500/20 shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Suggested Quick Searches if not yet searched */}
      {!hasSearched && (
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Popular Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSearchQuery(q);
                  performSearch(q);
                }}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-zinc-800/80 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="flex flex-col gap-3">
        {hasSearched && (
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <div className="text-xs text-zinc-400">
              Found <span className="font-semibold text-zinc-200">{combinedResults.length}</span>{' '}
              tracks for <span className="text-amber-400 font-medium">"{searchQuery}"</span>
            </div>
            {matchingLocalTracks.length > 0 && activeFilter === 'all' && (
              <span className="text-[11px] text-emerald-400 font-medium">
                Includes {matchingLocalTracks.length} local file match{matchingLocalTracks.length > 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs">Extracting metadata and streams from YouTube...</span>
          </div>
        ) : hasSearched && combinedResults.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            No results found. Please check spelling or paste a direct video link.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {combinedResults.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                playlistContext={combinedResults}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
