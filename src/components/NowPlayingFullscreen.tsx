import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { AudioVisualizer } from './AudioVisualizer';
import { formatTime } from '../utils/localFiles';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Mic2,
  Sliders,
  ListMusic,
  Moon,
  Tv,
} from 'lucide-react';

export const NowPlayingFullscreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isFullscreenOpen,
    setIsFullscreenOpen,
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
    setIsLyricsOpen,
    setIsEqualizerOpen,
    setIsQueueOpen,
    setIsSleepTimerOpen,
    sleepTimerRemaining,
    sleepAtTrackEnd,
    isVideoOpen,
    setIsVideoOpen,
  } = useAudio();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  if (!isFullscreenOpen || !currentTrack) return null;

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
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between overflow-hidden p-6 sm:p-12 animate-in fade-in duration-300">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none filter blur-3xl scale-125"
        style={{
          backgroundImage: `url(${currentTrack.thumbnail})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/90 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => setIsFullscreenOpen(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Minimize</span>
        </button>

        <div className="text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Playing from {currentTrack.source === 'local' ? 'Local Storage' : 'YouTube Stream'}
          </div>
          <div className="text-xs text-zinc-400 font-medium">{currentTrack.album || 'AuraStream Music'}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sleep Timer */}
          <button
            onClick={() => setIsSleepTimerOpen(true)}
            className={`p-2 rounded-full border transition-all ${
              sleepTimerRemaining !== null || sleepAtTrackEnd
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Sleep Timer"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEqualizerOpen(true)}
            className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLyricsOpen(true)}
            className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Lyrics"
          >
            <Mic2 className="w-4 h-4" />
          </button>
          {currentTrack.source === 'youtube' && (
            <button
              onClick={() => setIsVideoOpen(!isVideoOpen)}
              className={`p-2 rounded-full border transition-colors ${
                isVideoOpen
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Watch Video"
            >
              <Tv className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Large Cover + Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-6 max-w-xl mx-auto w-full">
        <div className="relative group">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-2xl shadow-2xl border border-zinc-800/80 transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>

        {/* Visualizer bar */}
        <div className="w-full flex justify-center h-12">
          <AudioVisualizer className="w-full max-w-md h-12 rounded-lg" height={48} />
        </div>

        {/* Track Title and Artist */}
        <div className="w-full flex items-center justify-between pt-2">
          <div className="min-w-0 pr-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {currentTrack.title}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 truncate mt-0.5">{currentTrack.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-3 text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? 'fill-amber-400 text-amber-400' : 'stroke-zinc-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-xl mx-auto w-full flex flex-col gap-4 pb-4">
        {/* Progress bar with smooth seeking */}
        <div className="flex flex-col gap-1.5">
          <div className="relative w-full h-2 bg-zinc-800 rounded-full group cursor-pointer overflow-hidden flex items-center">
            <div
              className="absolute left-0 top-0 bottom-0 bg-amber-500 rounded-full group-hover:bg-amber-400 transition-all pointer-events-none"
              style={{ width: `${progressPercent}%` }}
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
          <div className="flex justify-between text-xs font-mono tabular-nums text-zinc-400">
            <span>{formatTime(effectiveCurrentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffled ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-zinc-300 hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-zinc-300 hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-zinc-200">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 h-1 bg-zinc-800 rounded-full accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
