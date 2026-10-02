import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/localFiles';
import { Moon, Clock, X, Check, Disc3, Plus, RotateCcw } from 'lucide-react';

export const SleepTimerModal: React.FC = () => {
  const {
    isSleepTimerOpen,
    setIsSleepTimerOpen,
    sleepTimerRemaining,
    sleepAtTrackEnd,
    startSleepTimer,
    toggleSleepAtTrackEnd,
    cancelSleepTimer,
    extendSleepTimer,
    currentTrack,
  } = useAudio();

  const [customMinutes, setCustomMinutes] = useState<number>(20);

  if (!isSleepTimerOpen) return null;

  const presets = [5, 10, 15, 30, 45, 60, 90];
  const isTimerActive = sleepTimerRemaining !== null || sleepAtTrackEnd;

  const handleSelectPreset = (mins: number) => {
    startSleepTimer(mins);
    setIsSleepTimerOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMinutes > 0) {
      startSleepTimer(customMinutes);
      setIsSleepTimerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Sleep Timer</h2>
              <p className="text-xs text-zinc-400">
                Smoothly fade out and stop music when you fall asleep
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSleepTimerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Timer Status Card */}
        {isTimerActive && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Timer Active</span>
              </span>
              <button
                onClick={cancelSleepTimer}
                className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>

            <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
              {sleepAtTrackEnd ? (
                <span className="text-sm font-sans font-medium text-amber-400">
                  Stopping at end of current track
                </span>
              ) : (
                formatTime(sleepTimerRemaining || 0)
              )}
            </div>

            {!sleepAtTrackEnd && sleepTimerRemaining !== null && (
              <div className="flex items-center gap-2 pt-1 border-t border-indigo-900/50">
                <span className="text-[11px] text-zinc-400">Quick extend:</span>
                <button
                  onClick={() => extendSleepTimer(5)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 5m
                </button>
                <button
                  onClick={() => extendSleepTimer(15)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 15m
                </button>
              </div>
            )}
          </div>
        )}

        {/* Option 1: End of Track */}
        <button
          onClick={() => {
            toggleSleepAtTrackEnd();
            setIsSleepTimerOpen(false);
          }}
          disabled={!currentTrack}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
            sleepAtTrackEnd
              ? 'bg-amber-500/10 border-amber-500 text-amber-300'
              : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Disc3 className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-semibold">End of Current Track</div>
              <div className="text-[11px] text-zinc-500">
                {currentTrack ? `Stop after "${currentTrack.title.slice(0, 24)}..."` : 'No song currently playing'}
              </div>
            </div>
          </div>
          {sleepAtTrackEnd && <Check className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Option 2: Preset Minutes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Set Duration
          </span>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectPreset(mins)}
                className="py-2.5 px-2 bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 font-mono text-xs font-semibold rounded-xl transition-all border border-zinc-700/50"
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Option 3: Custom Slider */}
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Custom Time</span>
            <span className="font-mono tabular-nums text-amber-400 font-bold">
              {customMinutes} minutes
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="120"
            step="1"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
          />

          <button
            type="submit"
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs rounded-xl transition-colors shadow-sm shadow-amber-500/20 mt-1"
          >
            Start Timer for {customMinutes} Minutes
          </button>
        </form>
      </div>
    </div>
  );
};
