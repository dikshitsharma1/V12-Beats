import React from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import { Heart, Play, Shuffle } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { favorites, playTrack } = useAudio();

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playTrack(favorites[0], favorites);
    }
  };

  const handleShufflePlay = () => {
    if (favorites.length > 0) {
      const shuffled = [...favorites].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Banner */}
      <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Personal Collection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-display">
            Liked Songs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {favorites.length} saved track{favorites.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-400/20"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play Liked</span>
          </button>
          <button
            onClick={handleShufflePlay}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl text-xs transition-colors border border-zinc-800"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Track List */}
      {favorites.length === 0 ? (
        <div className="p-16 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/40">
          <Heart className="w-12 h-12 stroke-1 text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-200">No liked songs yet</h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            Click the heart icon on any YouTube stream or local track to save it to your personal
            favorites.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {favorites.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              playlistContext={favorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};
