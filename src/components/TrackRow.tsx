import React, { useState } from 'react';
import { Track, Playlist } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
  Play,
  Pause,
  Heart,
  Plus,
  Trash2,
  MoreVertical,
  Check,
  Music,
  Share2,
} from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistContext?: Track[];
  onRemoveFromPlaylist?: (trackId: string) => void;
  showIndex?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  playlistContext,
  onRemoveFromPlaylist,
  showIndex = true,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isFavorite,
    toggleLike,
    addToQueue,
    playlists,
    addTrackToPlaylist,
    deleteLocalFile,
  } = useAudio();
  const { theme } = useTheme();

  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isLiked = isFavorite(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, playlistContext);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between px-3 sm:px-4 py-2 rounded-md cursor-pointer transition-colors ${
        isCurrent
          ? 'bg-[#2a2a2a]'
          : 'hover:bg-[#2a2a2a]/60 text-zinc-300'
      }`}
    >
      {/* Left: Index / Play Icon, Thumbnail, Title & Artist */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {showIndex && (
          <div className="w-5 text-center shrink-0">
            {isPlayingThis ? (
              <div className="flex items-end justify-center gap-0.5 h-3.5">
                <span className={`w-0.5 h-full ${theme.bgClass} animate-[bounce_0.6s_ease-in-out_infinite]`} />
                <span className={`w-0.5 h-2/3 ${theme.bgClass} animate-[bounce_0.8s_ease-in-out_infinite]`} />
                <span className={`w-0.5 h-4/5 ${theme.bgClass} animate-[bounce_0.5s_ease-in-out_infinite]`} />
              </div>
            ) : (
              <>
                <span className={`text-xs font-mono tabular-nums ${isCurrent ? theme.textClass : 'text-[#b3b3b3]'} group-hover:hidden`}>
                  {index + 1}
                </span>
                <Play className="w-3.5 h-3.5 text-white fill-current hidden group-hover:block mx-auto" />
              </>
            )}
          </div>
        )}

        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-10 h-10 rounded object-cover bg-zinc-900 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div
            className={`text-xs sm:text-sm font-semibold truncate ${
              isCurrent ? theme.textClass : 'text-white'
            }`}
          >
            {track.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#b3b3b3] truncate mt-0.5">
            <span className="truncate hover:text-white hover:underline">{track.artist}</span>
            {track.album && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="truncate">{track.album}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Duration, Like, Menu */}
      <div
        className="flex items-center gap-2 sm:gap-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => toggleLike(track)}
          className={`p-1.5 rounded transition-colors ${
            isLiked
              ? theme.textClass
              : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <span className="text-xs font-mono tabular-nums text-[#b3b3b3] w-10 text-right">
          {track.formattedDuration}
        </span>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[#b3b3b3] hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-44 bg-[#282828] border border-zinc-700 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5 text-xs animate-in fade-in duration-100">
              <button
                onClick={() => {
                  addToQueue(track);
                  setShowMenu(false);
                }}
                className="px-2.5 py-1.5 text-left text-zinc-200 hover:bg-[#383838] hover:text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => setShowPlaylistPicker(!showPlaylistPicker)}
                className="px-2.5 py-1.5 text-left text-zinc-200 hover:bg-[#383838] hover:text-white rounded-lg flex items-center gap-2"
              >
                <Music className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add to Playlist</span>
              </button>

              {showPlaylistPicker && (
                <div className="pl-4 py-1 flex flex-col gap-1 border-l border-zinc-700 my-1">
                  {playlists.length === 0 ? (
                    <span className="text-[11px] text-zinc-500 px-2">No playlists yet</span>
                  ) : (
                    playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, track);
                          setShowMenu(false);
                          setShowPlaylistPicker(false);
                        }}
                        className="px-2 py-1 text-left text-[11px] text-zinc-400 hover:text-white truncate"
                      >
                        {pl.name}
                      </button>
                    ))
                  )}
                </div>
              )}

              {onRemoveFromPlaylist && (
                <button
                  onClick={() => {
                    onRemoveFromPlaylist(track.id);
                    setShowMenu(false);
                  }}
                  className="px-2.5 py-1.5 text-left text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from Playlist</span>
                </button>
              )}

              {track.source === 'local' && (
                <button
                  onClick={() => {
                    deleteLocalFile(track.id);
                    setShowMenu(false);
                  }}
                  className="px-2.5 py-1.5 text-left text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete from Storage</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
