import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/localFiles';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Maximize2,
  ListMusic,
  Sliders,
  Mic2,
  Moon,
  Sparkles,
  Loader2,
  Tv,
} from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    repeatMode,
    isShuffled,
    visualizerMode,
    sleepTimerRemaining,
    sleepAtTrackEnd,
    setIsSleepTimerOpen,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleRepeat,
    toggleShuffle,
    setVisualizerMode,
    isFavorite,
    toggleLike,
    setIsEqualizerOpen,
    setIsQueueOpen,
    setIsLyricsOpen,
    setIsFullscreenOpen,
    isVideoOpen,
    setIsVideoOpen,
  } = useAudio();

  const [isRateMenuOpen, setIsRateMenuOpen] = useState(false);
  const [isVisMenuOpen, setIsVisMenuOpen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  if (!currentTrack) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-xl px-4 flex items-center justify-between text-zinc-500 text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <div>
            <span className="text-zinc-300 font-medium">Ready to play</span>
            <span className="block text-[11px] text-zinc-500">
              Search YouTube music or import local files to start listening
            </span>
          </div>
        </div>
      </footer>
    );
  }

  const isLiked = isFavorite(currentTrack.id);
  const effectiveCurrentTime = isScrubbing ? scrubTime : currentTime;
  const effectiveDuration = duration > 0 ? duration : currentTrack.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (effectiveCurrentTime / effectiveDuration) * 100));

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubTime(val);
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
    <footer className="fixed bottom-0 left-0 right-0 h-20 sm:h-22 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* LEFT ZONE: Current Track Information */}
      <div className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3">
        <div
          onClick={() => setIsFullscreenOpen(true)}
          className="relative group cursor-pointer shrink-0"
        >
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover border border-zinc-800 transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => setIsFullscreenOpen(true)}
              className="text-xs sm:text-sm font-semibold text-zinc-100 truncate cursor-pointer hover:underline hover:text-amber-400 transition-colors"
            >
              {currentTrack.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
            <span className="truncate">{currentTrack.artist}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400 capitalize shrink-0 font-medium">
              {currentTrack.source === 'youtube' ? 'YouTube' : 'Local'}
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-2 text-zinc-400 hover:text-amber-400 transition-colors shrink-0"
          title={isLiked ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'fill-amber-400 text-amber-400' : 'stroke-zinc-400'
            }`}
          />
        </button>
      </div>

      {/* CENTER ZONE: Playback Controls & Progress Bar */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2 sm:px-6">
        {/* Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 mb-1">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors hidden sm:block ${
              isShuffled ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={`Shuffle is ${isShuffled ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-transform active:scale-95 shadow-sm shadow-amber-500/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Next track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 transition-colors hidden sm:block ${
              repeatMode !== 'off' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Time Bar with smooth seeking */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-8 text-right shrink-0">
            {formatTime(effectiveCurrentTime)}
          </span>

          <div className="relative flex-1 h-2 bg-zinc-800 rounded-full group cursor-pointer flex items-center">
            <div
              className="absolute left-0 top-0 bottom-0 bg-amber-500 rounded-full group-hover:bg-amber-400 transition-all pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Playhead marker on hover */}
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

          <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-8 text-left shrink-0">
            {formatTime(effectiveDuration)}
          </span>
        </div>
      </div>

      {/* RIGHT ZONE: Audio Features, Sleep Timer, Visualizer, Volume */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-1/4 sm:w-1/3">
        {/* Inline Audio Visualizer Preview */}
        <div className="hidden xl:block mr-1">
          <AudioVisualizer height={22} className="w-20 h-5 opacity-75" />
        </div>

        {/* Sleep Timer Button with Countdown Indicator */}
        <button
          onClick={() => setIsSleepTimerOpen(true)}
          className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
            sleepTimerRemaining !== null || sleepAtTrackEnd
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Sleep Timer (stop playback automatically)"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono tabular-nums hidden sm:inline">
            {sleepAtTrackEnd
              ? 'Track End'
              : sleepTimerRemaining !== null
              ? formatTime(sleepTimerRemaining)
              : 'Timer'}
          </span>
        </button>

        {/* Visualizer Mode Toggle */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsVisMenuOpen(!isVisMenuOpen)}
            className={`p-1.5 rounded-md transition-colors ${
              visualizerMode !== 'off'
                ? 'text-amber-400 hover:bg-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={`Visualizer mode: ${visualizerMode}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          {isVisMenuOpen && (
            <div className="absolute bottom-10 right-0 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5 text-xs">
              <span className="px-2 py-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                Visualizer
              </span>
              {(['bars', 'wave', 'spectrum', 'orb', 'off'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setVisualizerMode(m);
                    setIsVisMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-left capitalize transition-colors ${
                    visualizerMode === m
                      ? 'bg-amber-500/10 text-amber-400 font-medium'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lyrics */}
        <button
          onClick={() => setIsLyricsOpen(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors hidden sm:block"
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Equalizer */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="10-Band Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Speed / Rate Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsRateMenuOpen(!isRateMenuOpen)}
            className="px-2 py-1 rounded text-[11px] font-mono font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
          {isRateMenuOpen && (
            <div className="absolute bottom-10 right-0 w-24 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1 z-50 flex flex-col gap-0.5 text-xs">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setIsRateMenuOpen(false);
                  }}
                  className={`px-2 py-1 rounded-md text-left font-mono tabular-nums ${
                    playbackRate === rate
                      ? 'bg-amber-500/10 text-amber-400 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Mode Toggle */}
        {currentTrack.source === 'youtube' && (
          <button
            onClick={() => setIsVideoOpen(!isVideoOpen)}
            className={`p-1.5 rounded-md transition-colors ${
              isVideoOpen
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title={isVideoOpen ? 'Close video' : 'Watch video'}
          >
            <Tv className="w-4 h-4" />
          </button>
        )}

        {/* Queue */}
        <button
          onClick={() => setIsQueueOpen(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Bar */}
        <div className="hidden lg:flex items-center gap-2 pl-1">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
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
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-zinc-800 rounded-full accent-amber-500"
          />
        </div>
      </div>
    </footer>
  );
};
