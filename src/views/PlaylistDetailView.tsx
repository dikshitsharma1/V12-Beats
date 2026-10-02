import React from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import { Play, Shuffle, Trash2, Music, Clock } from 'lucide-react';
import { formatTime } from '../utils/localFiles';

interface PlaylistDetailViewProps {
  playlistId: string;
  onBack: () => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlistId,
  onBack,
}) => {
  const {
    playlists,
    playTrack,
    removeTrackFromPlaylist,
    deletePlaylist,
  } = useAudio();

  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="p-8 text-center text-zinc-500 text-xs">
        Playlist not found.
        <button onClick={onBack} className="block mx-auto mt-2 text-amber-400 underline">
          Return to Library
        </button>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length > 0) {
      const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-5">
          {playlist.coverArt ? (
            <img
              src={playlist.coverArt}
              alt={playlist.name}
              className="w-20 h-20 rounded-2xl object-cover border border-zinc-800 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 shrink-0 shadow-lg shadow-amber-500/10">
              <Music className="w-9 h-9" />
            </div>
          )}

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Custom Playlist
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-display">
              {playlist.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>{playlist.tracks.length} tracks</span>
              <span aria-hidden="true">·</span>
              <span>{formatTime(totalDuration)} total run time</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm(`Delete playlist "${playlist.name}"?`)) {
              deletePlaylist(playlist.id);
              onBack();
            }
          }}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
          title="Delete playlist"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Action Controls */}
      {playlist.tracks.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-400/20"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play All</span>
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

      {/* Tracks List */}
      {playlist.tracks.length === 0 ? (
        <div className="p-16 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/40">
          <Music className="w-12 h-12 stroke-1 text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-200">Playlist is empty</h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            Search songs on YouTube or import local audio files, then click the three dots menu (⋮)
            to add them to this playlist.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {playlist.tracks.map((track, idx) => (
            <TrackRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              playlistContext={playlist.tracks}
              onRemoveFromPlaylist={(tid) => removeTrackFromPlaylist(playlist.id, tid)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
