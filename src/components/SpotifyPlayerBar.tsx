import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/localFiles';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Mic2,
  ListMusic,
  Sliders,
  Moon,
  Tv,
  PanelRight,
  PanelRightClose,
  Loader2,
} from 'lucide-react';

interface SpotifyPlayerBarProps {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
}

export const SpotifyPlayerBar: React.FC<SpotifyPlayerBarProps> = ({
  isRightPanelOpen,
  setIsRightPanelOpen,
}) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    isFavorite,
    toggleLike,
    setIsEqualizerOpen,
    setIsQueueOpen,
    setIsLyricsOpen,
    setIsFullscreenOpen,
    setIsSleepTimerOpen,
    sleepTimerRemaining,
    isVideoOpen,
    setIsVideoOpen,
  } = useAudio();
  const { theme } = useTheme();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  if (!currentTrack) {
    return (
      <footer className="h-20 bg-black border-t border-zinc-900 px-4 flex items-center justify-between text-[#b3b3b3] select-none text-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#181818] flex items-center justify-center text-zinc-600">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <span className="text-zinc-400">Ready to play · Select any song to start</span>
        </div>
      </footer>
    );
  }

  const isLiked = isFavorite(currentTrack.id);
  const effectiveCurrentTime = isScrubbing ? scrubTime : currentTime;
  const effectiveDuration = duration > 0 ? duration : currentTrack.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (effectiveCurrentTime / effectiveDuration) * 100));

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubTime(parseFloat(e.target.value));
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubTime(currentTime);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    seek(scrubTime);
  };

  return (
    <footer className="h-20 sm:h-[88px] bg-black border-t border-[#282828]/60 px-4 sm:px-6 flex items-center justify-between z-40 select-none text-white">
      {/* LEFT ZONE: Track Info */}
      <div className="flex items-center gap-3.5 w-1/4 sm:w-1/3 min-w-0">
        <div
          onClick={() => setIsFullscreenOpen(true)}
          className="relative group cursor-pointer shrink-0"
        >
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover shadow"
          />
          <div className="absolute inset-0 bg-black/40 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h4
            onClick={() => setIsFullscreenOpen(true)}
            className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:underline"
          >
            {currentTrack.title}
          </h4>
          <p className="text-[11px] text-[#b3b3b3] truncate hover:text-white hover:underline cursor-pointer mt-0.5">
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={() => toggleLike(currentTrack)}
          className={`p-1.5 transition-colors shrink-0 ${
            isLiked ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
          }`}
          title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {currentTrack.source === 'youtube' && (
          <button
            onClick={() => setIsVideoOpen(!isVideoOpen)}
            className={`p-1.5 transition-colors shrink-0 hidden sm:block ${
              isVideoOpen ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Video dock"
          >
            <Tv className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CENTER ZONE: Controls & Progress Bar (Exact Spotify Design) */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2 sm:px-6">
        {/* Buttons Row */}
        <div className="flex items-center gap-3 sm:gap-5 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors relative ${
              isShuffled ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffled && (
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${theme.bgClass}`}
              />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Spotify Classic Circular Play / Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1 transition-colors relative ${
              repeatMode !== 'off' ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={`Repeat ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {repeatMode !== 'off' && (
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${theme.bgClass}`}
              />
            )}
          </button>
        </div>

        {/* Time Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] font-mono tabular-nums text-[#a7a7a7] w-9 text-right shrink-0">
            {formatTime(effectiveCurrentTime)}
          </span>

          <div className="relative flex-1 h-1 group cursor-pointer flex items-center py-2">
            {/* Background track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              <div
                className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${theme.bgClass}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Glowing playhead thumb on hover */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full shadow -ml-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />

            <input
              type="range"
              min="0"
              max={effectiveDuration}
              step="0.5"
              value={effectiveCurrentTime}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrubChange}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <span className="text-[11px] font-mono tabular-nums text-[#a7a7a7] w-9 text-left shrink-0">
            {formatTime(effectiveDuration)}
          </span>
        </div>
      </div>

      {/* RIGHT ZONE: Extra Spotify Tools & Volume */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4 sm:w-1/3">
        {/* Now Playing View Toggle */}
        <button
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className={`p-1.5 transition-colors hidden lg:block ${
            isRightPanelOpen ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Now playing view"
        >
          {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
        </button>

        {/* Lyrics */}
        <button
          onClick={() => setIsLyricsOpen(true)}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors hidden sm:block"
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue */}
        <button
          onClick={() => setIsQueueOpen(true)}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Equalizer */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors hidden sm:block"
          title="Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Sleep Timer */}
        <button
          onClick={() => setIsSleepTimerOpen(true)}
          className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
            sleepTimerRemaining !== null ? theme.textClass : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
          {sleepTimerRemaining !== null && (
            <span className="text-[10px] font-mono tabular-nums hidden xl:inline">
              {formatTime(sleepTimerRemaining)}
            </span>
          )}
        </button>

        {/* Spotify Volume Slider */}
        <div className="hidden sm:flex items-center gap-2 pl-1">
          <button
            onClick={toggleMute}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="relative w-20 sm:w-24 h-1 group flex items-center py-2 cursor-pointer">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              <div
                className={`absolute left-0 top-0 bottom-0 rounded-full ${
                  isMuted ? 'w-0' : theme.bgClass
                }`}
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => setIsFullscreenOpen(true)}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors hidden sm:block"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
