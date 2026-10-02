import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { AudioEngine, EQ_FREQUENCIES, EQ_PRESETS } from '../utils/audioEngine';
import { X, Sliders, RotateCcw } from 'lucide-react';

export const EqualizerModal: React.FC = () => {
  const { isEqualizerOpen, setIsEqualizerOpen } = useAudio();
  const [activePreset, setActivePreset] = useState<string>('Flat');
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  if (!isEqualizerOpen) return null;

  const handleBandChange = (index: number, val: number) => {
    const next = [...gains];
    next[index] = val;
    setGains(next);
    setActivePreset('Custom');
    AudioEngine.getInstance().setEqualizerBand(index, val);
  };

  const handleSelectPreset = (name: string) => {
    const presetGains = EQ_PRESETS[name];
    if (presetGains) {
      setActivePreset(name);
      setGains([...presetGains]);
      AudioEngine.getInstance().setEqualizerPreset(presetGains);
    }
  };

  const handleReset = () => {
    handleSelectPreset('Flat');
  };

  const formatFreq = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}Hz`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Audio Equalizer & DSP</h2>
              <p className="text-xs text-zinc-400">10-Band precision hardware parametric filters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Reset to flat response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsEqualizerOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Acoustic Profiles</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EQ_PRESETS).map((preset) => {
              const isActive = activePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm shadow-amber-500/20'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10-Band Sliders Grid */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-6">
          <div className="grid grid-cols-10 gap-2 h-56 items-center">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const val = gains[idx] || 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between">
                  <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                    {val > 0 ? `+${val}` : val}dB
                  </span>

                  <div className="relative flex items-center justify-center h-36 w-6">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={val}
                      onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                      className="w-36 h-1.5 origin-center -rotate-90 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 font-medium">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-4 border-t border-zinc-800/60 mt-3">
            <span>Low Frequencies (Bass)</span>
            <span>Mid Range (Vocals)</span>
            <span>High Frequencies (Treble)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
