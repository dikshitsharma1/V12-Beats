import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { TrackRow } from '../components/TrackRow';
import {
  Search,
  Play,
  Pause,
  Loader2,
  Sparkles,
  Flame,
  Heart,
  Zap,
  Coffee,
  Moon,
  Compass,
  Radio,
  Music,
} from 'lucide-react';

interface BrowseTile {
  id: string;
  title: string;
  query: string;
  gradient: string;
  image: string;
}

const SPOTIFY_BROWSE_TILES: BrowseTile[] = [
  {
    id: 'bollywood',
    title: 'Bollywood Hits',
    query: 'latest bollywood songs trending hits',
    gradient: 'from-rose-600 to-red-900',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
  },
  {
    id: 'punjabi',
    title: 'Punjabi 101',
    query: 'punjabi hits diljit dosanjh karan aujla ap dhillon',
    gradient: 'from-amber-600 to-yellow-800',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  },
  {
    id: 'desi_hiphop',
    title: 'Desi Hip Hop',
    query: 'desi hip hop divine seedhe maut krsna raftaar',
    gradient: 'from-orange-600 to-stone-900',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
  },
  {
    id: 'romance',
    title: 'Romance & Love',
    query: 'romantic hindi love songs arijit singh shreya ghoshal',
    gradient: 'from-pink-600 to-purple-900',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&h=300&fit=crop',
  },
  {
    id: 'indie',
    title: 'Indie India',
    query: 'indian indie acoustic prateek kuhad anuv jain',
    gradient: 'from-emerald-600 to-teal-900',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
  },
  {
    id: 'lofi',
    title: 'Chill & Lo-Fi',
    query: 'bollywood lofi chill beats hindi lofi songs playlist',
    gradient: 'from-blue-600 to-indigo-950',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop',
  },
  {
    id: 'sufi',
    title: 'Sufi & Ghazals',
    query: 'sufi songs nusrat rahat fateh ali khan jagjit singh',
    gradient: 'from-violet-600 to-purple-950',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
  },
  {
    id: 'pop',
    title: 'Global Pop',
    query: 'top global hits billboard pop 2025',
    gradient: 'from-cyan-600 to-blue-900',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  },
  {
    id: 'workout',
    title: 'Workout & Gym',
    query: 'workout music high energy motivational gym',
    gradient: 'from-red-600 to-orange-900',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&h=300&fit=crop',
  },
  {
    id: 'nostalgia',
    title: '90s & 2000s Nostalgia',
    query: '90s 2000s bollywood hits udit narayan alka yagnik sonu nigam',
    gradient: 'from-fuchsia-600 to-rose-900',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
  },
  {
    id: 'devotional',
    title: 'Devotional & Bhakti',
    query: 'hanuman chalisa shiva stotram morning bhakti songs',
    gradient: 'from-amber-700 to-yellow-950',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop',
  },
  {
    id: 'dance',
    title: 'Dance & EDM',
    query: 'melodic edm club dance bangers',
    gradient: 'from-lime-600 to-emerald-950',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop',
  },
];

export const SpotifySearchView: React.FC<{ initialQuery?: string }> = ({
  initialQuery = '',
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { theme } = useTheme();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [selectedTile, setSelectedTile] = useState<BrowseTile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSelectedTile(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
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

  const handleTileClick = (tile: BrowseTile) => {
    setSelectedTile(tile);
    setQuery(tile.title);
    handleSearch(tile.query);
  };

  const topResult = results[0] || null;

  return (
    <div className="flex flex-col gap-6 pb-16 text-white select-none">
      {/* If Searching / Results Active */}
      {results.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Search results for "{query}"
            </h2>
            <button
              onClick={() => {
                setResults([]);
                setSelectedTile(null);
                setQuery('');
              }}
              className="text-xs text-[#b3b3b3] hover:text-white hover:underline"
            >
              Clear search
            </button>
          </div>

          {/* Spotify Top Result Card + Songs List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Result Card */}
            {topResult && (
              <div className="lg:col-span-1 flex flex-col gap-3">
                <span className="text-lg font-bold text-white">Top result</span>
                <div
                  onClick={() => playTrack(topResult, results)}
                  className="group relative p-5 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all cursor-pointer flex flex-col justify-between h-56"
                >
                  <img
                    src={topResult.thumbnail}
                    alt={topResult.title}
                    className="w-24 h-24 rounded shadow-lg object-cover"
                  />

                  <div>
                    <h3 className="text-2xl font-bold text-white truncate hover:underline mt-3">
                      {topResult.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#b3b3b3] mt-1">
                      <span className="font-semibold text-white">{topResult.artist}</span>
                      <span>·</span>
                      <span className="uppercase px-1.5 py-0.5 rounded bg-black/60 font-bold text-[9px]">
                        Song
                      </span>
                    </div>
                  </div>

                  {/* Circular Hover Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(topResult, results);
                    }}
                    className={`absolute bottom-5 right-5 w-12 h-12 rounded-full ${theme.bgClass} ${theme.hoverBgClass} text-black flex items-center justify-center shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95`}
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Songs List */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <span className="text-lg font-bold text-white">Songs</span>
              <div className="flex flex-col gap-1">
                {results.slice(0, 5).map((track, idx) => (
                  <TrackRow
                    key={`${track.id}-${idx}`}
                    track={track}
                    index={idx}
                    playlistContext={results}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Remaining Results */}
          {results.length > 5 && (
            <div className="flex flex-col gap-2 pt-4">
              <span className="text-lg font-bold text-white">More songs</span>
              <div className="flex flex-col gap-1">
                {results.slice(5).map((track, idx) => (
                  <TrackRow
                    key={`more-${track.id}-${idx}`}
                    track={track}
                    index={idx + 5}
                    playlistContext={results}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
          <Loader2 className={`w-8 h-8 animate-spin ${theme.textClass}`} />
          <span className="text-xs">Searching music catalog...</span>
        </div>
      ) : (
        /* SPOTIFY BROWSE ALL SECTION (Signature Angled Category Tiles) */
        <div className="flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Browse all
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {SPOTIFY_BROWSE_TILES.map((tile) => (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`relative h-44 rounded-lg overflow-hidden p-4 bg-gradient-to-br ${tile.gradient} cursor-pointer group shadow-md transition-transform duration-200 hover:scale-[1.02]`}
              >
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight max-w-[80%]">
                  {tile.title}
                </h3>

                {/* Spotify 45-degree angled tilted image at bottom-right */}
                <img
                  src={tile.image}
                  alt={tile.title}
                  className="absolute -bottom-2 -right-4 w-24 h-24 object-cover shadow-2xl rounded rotate-[25deg] group-hover:rotate-[28deg] group-hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
