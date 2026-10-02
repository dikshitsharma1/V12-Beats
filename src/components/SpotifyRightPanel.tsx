import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Heart,
  Plus,
  Tv,
  Music2,
  Share2,
  Check,
  Disc3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SpotifyRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotifyRightPanel: React.FC<SpotifyRightPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTrack, isFavorite, toggleLike, queue, queueIndex, playTrack, isVideoOpen, setIsVideoOpen } = useAudio();
  const { theme } = useTheme();

  if (!isOpen || !currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const nextTrack = queue[queueIndex + 1] || null;

  return (
    <aside className="w-80 bg-[#121212] rounded-lg m-2 ml-0 p-4 flex flex-col gap-5 overflow-y-auto h-[calc(100vh-100px)] shrink-0 hidden lg:flex select-none text-white border-l border-zinc-800/40">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
        <span className="font-bold text-sm tracking-tight text-white hover:underline cursor-pointer truncate pr-2">
          {currentTrack.album || 'Now Playing'}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Large Cover Art */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-zinc-950 group">
        <img
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-full h-full object-cover"
        />

        {/* Video Mode Button */}
        {currentTrack.source === 'youtube' && (
          <button
            onClick={() => setIsVideoOpen(!isVideoOpen)}
            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/75 hover:bg-black backdrop-blur-md rounded-md text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors shadow-lg"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isVideoOpen ? 'Close Video' : 'Watch Video'}</span>
          </button>
        )}
      </div>

      {/* Track Info & Like Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-white truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </h2>
          <p className="text-sm text-[#b3b3b3] hover:text-white hover:underline cursor-pointer truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={() => toggleLike(currentTrack)}
          className={`p-2 transition-colors shrink-0 ${
            isLiked ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
          }`}
          title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* "About the artist" Spotify Card */}
      <div className="rounded-xl overflow-hidden bg-[#242424] flex flex-col relative group">
        <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.artist}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-transparent to-black/30" />
          <span className="absolute top-3 left-3 text-xs font-bold text-white tracking-wider uppercase drop-shadow">
            About the artist
          </span>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white hover:underline cursor-pointer">
              {currentTrack.artist}
            </h3>
            <ShieldCheck className={`w-4 h-4 ${theme.textClass}`} />
          </div>

          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span>12,458,920 monthly listeners</span>
            <button className="px-3 py-1 rounded-full border border-zinc-600 hover:border-white text-white font-bold text-xs transition-colors">
              Follow
            </button>
          </div>

          <p className="text-xs text-[#b3b3b3] line-clamp-3 leading-relaxed mt-1">
            {currentTrack.artist} is one of the most streamed icons in contemporary music, captivating
            millions worldwide with soulful melodies and chart-topping releases.
          </p>
        </div>
      </div>

      {/* "Next in queue" Spotify Card */}
      {nextTrack && (
        <div className="rounded-xl bg-[#242424] p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Next in queue</span>
            <span
              onClick={() => playTrack(nextTrack, queue)}
              className="text-[#b3b3b3] hover:text-white text-[11px] cursor-pointer"
            >
              Open queue
            </span>
          </div>

          <div
            onClick={() => playTrack(nextTrack, queue)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer transition-colors"
          >
            <img
              src={nextTrack.thumbnail}
              alt={nextTrack.title}
              className="w-11 h-11 rounded object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate block hover:underline">
                {nextTrack.title}
              </span>
              <span className="text-[11px] text-[#b3b3b3] truncate block mt-0.5">
                {nextTrack.artist}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Credits */}
      <div className="rounded-xl bg-[#242424] p-4 flex flex-col gap-2 text-xs">
        <span className="font-bold text-white">Credits</span>
        <div className="flex flex-col gap-1 text-[#b3b3b3]">
          <div>
            <span className="text-white font-medium">{currentTrack.artist}</span>
            <span className="block text-[11px]">Main Artist</span>
          </div>
          <div className="pt-1 border-t border-zinc-700/50">
            <span className="text-white font-medium">{currentTrack.source === 'local' ? 'Local Audio File' : 'YouTube Music Stream'}</span>
            <span className="block text-[11px]">Audio Source</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
