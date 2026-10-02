import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import {
  Play,
  Shuffle,
  Compass,
  Radio,
  Sparkles,
  Flame,
  Headphones,
  Coffee,
  Zap,
  Moon,
  Loader2,
  Heart,
} from 'lucide-react';

const GENRES = [
  { id: 'indian_trending', label: 'Bollywood Trending', icon: Flame, color: 'from-amber-500/20 to-orange-500/10' },
  { id: 'bollywood_romance', label: 'Bollywood Romance', icon: Heart, color: 'from-rose-500/20 to-pink-500/10' },
  { id: 'punjabi_hits', label: 'Punjabi Hits', icon: Zap, color: 'from-yellow-500/20 to-amber-500/10' },
  { id: 'desi_hiphop', label: 'Desi Hip Hop', icon: Flame, color: 'from-orange-500/20 to-red-500/10' },
  { id: 'indian_indie', label: 'Indian Indie', icon: Sparkles, color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'sufi_ghazals', label: 'Sufi & Ghazals', icon: Moon, color: 'from-violet-500/20 to-purple-500/10' },
  { id: 'bollywood_lofi', label: 'Bollywood Lo-Fi', icon: Coffee, color: 'from-indigo-500/20 to-blue-500/10' },
  { id: 'trending', label: 'Global Top Hits', icon: Radio, color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'lofi', label: 'Lo-Fi Chillhop', icon: Coffee, color: 'from-rose-500/20 to-purple-500/10' },
  { id: 'synthwave', label: 'Synthwave 80s', icon: Zap, color: 'from-fuchsia-500/20 to-cyan-500/10' },
  { id: 'gym', label: 'Gym & Workout', icon: Zap, color: 'from-orange-500/20 to-red-500/10' },
];

export const ExploreView: React.FC = () => {
  const { playTrack } = useAudio();
  const [selectedGenre, setSelectedGenre] = useState('trending');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/curated?genre=${selectedGenre}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setTracks(data.tracks || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching curated genre:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const currentGenreMeta = GENRES.find((g) => g.id === selectedGenre) || GENRES[0];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Curated Daily Radar · Zero Ad Interruptions</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            AuraStream Midnight Essentials
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
            Stream directly from YouTube without ads or telemetry. Mix seamlessly with your private
            offline music library.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-400/20 active:scale-98 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Featured Mix</span>
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium rounded-xl text-xs transition-colors border border-zinc-700/60 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Genre Categories Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
            Browse Moods & Genres
          </h2>
          <span className="text-xs text-zinc-500">Real-time YouTube extraction</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => {
            const Icon = genre.icon;
            const isSelected = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{genre.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracks Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-200">
              {currentGenreMeta.label} Selection
            </h3>
            <span className="text-xs text-zinc-500">· {tracks.length} tracks</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-medium">Extracting audio streams from YouTube...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            No tracks found for this mood. Try another category!
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                playlistContext={tracks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
