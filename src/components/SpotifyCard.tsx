import React from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { Play, Pause } from 'lucide-react';

interface SpotifyCardProps {
  track: Track;
  playlistContext?: Track[];
  isArtist?: boolean;
  subtitle?: string;
  onClick?: () => void;
}

export const SpotifyCard: React.FC<SpotifyCardProps> = ({
  track,
  playlistContext,
  isArtist = false,
  subtitle,
  onClick,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudio();
  const { theme } = useTheme();

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      if (isCurrent) {
        togglePlayPause();
      } else {
        playTrack(track, playlistContext);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative p-3 sm:p-4 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square mb-3">
        <img
          src={track.thumbnail}
          alt={track.title}
          className={`w-full h-full object-cover shadow-lg ${
            isArtist ? 'rounded-full shadow-2xl' : 'rounded-md'
          }`}
          loading="lazy"
        />

        {/* Spotify Signature Floating Circular Play Button */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${
            theme.bgClass
          } ${
            theme.hoverBgClass
          } text-black flex items-center justify-center shadow-2xl shadow-black/80 transition-all duration-300 active:scale-95 ${
            isPlayingThis
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
          }`}
          title={isPlayingThis ? 'Pause' : 'Play'}
        >
          {isPlayingThis ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Track / Artist Text */}
      <div className="flex flex-col min-w-0">
        <h3
          className={`text-sm sm:text-base font-bold truncate leading-tight ${
            isCurrent ? theme.textClass : 'text-white'
          }`}
        >
          {track.title}
        </h3>
        <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1 leading-snug">
          {subtitle || track.artist}
        </p>
      </div>
    </div>
  );
};
