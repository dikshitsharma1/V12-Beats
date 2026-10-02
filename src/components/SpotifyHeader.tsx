import React, { useState } from 'react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Palette,
  User,
  Sliders,
  Moon,
  Sparkles,
  Maximize2,
} from 'lucide-react';

interface SpotifyHeaderProps {
  onSearchSubmit: (q: string) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

export const SpotifyHeader: React.FC<SpotifyHeaderProps> = ({
  onSearchSubmit,
  activeTab,
  setActiveTab,
  canGoBack = true,
  canGoForward = false,
  onGoBack,
  onGoForward,
}) => {
  const { currentTheme, setTheme, theme } = useTheme();
  const { setIsFullscreenOpen, setIsEqualizerOpen, setIsSleepTimerOpen, sleepTimerRemaining } = useAudio();
  const [searchInput, setSearchInput] = useState('');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
      setActiveTab('search');
    }
  };

  const handleClear = () => {
    setSearchInput('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#121212]/95 backdrop-blur-md flex items-center justify-between gap-4 border-b border-zinc-800/40 select-none">
      {/* Left: Navigation Arrows & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Spotify Circular Back & Forward Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onGoBack?.()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onGoForward?.()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-zinc-300 hover:text-white transition-colors opacity-50 cursor-not-allowed"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Spotify Search Pill Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (activeTab !== 'search') {
                setActiveTab('search');
              }
            }}
            placeholder="What do you want to play?"
            className="w-full h-10 pl-10 pr-9 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] text-white placeholder-[#757575] text-xs sm:text-sm rounded-full border border-transparent focus:border-white focus:outline-none transition-all shadow-inner"
          />
          {searchInput && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Contextual Category Chips */}
      <div className="hidden xl:flex items-center gap-2">
        {[
          { id: 'home', label: 'All' },
          { id: 'indian', label: 'Indian & Desi' },
          { id: 'recommendations', label: 'Made For You' },
          { id: 'explore', label: 'Explore & Curated' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveTab(chip.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === chip.id
                ? 'bg-white text-black'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Right: Theme / Palette Switcher, Quick Tools, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Accent Color Theme Switcher Dropdown ("Just different colours") */}
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-xs font-semibold text-white transition-colors border border-zinc-700/50"
            title="Change Spotify Theme Color"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.hex }}
            />
            <span className="hidden sm:inline">{theme.name}</span>
            <Palette className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-[#282828] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
              <span className="px-2 py-1 text-[10px] text-[#b3b3b3] font-bold uppercase tracking-wider">
                Accent Theme
              </span>
              {(Object.keys(THEMES) as ThemeId[]).map((tKey) => {
                const t = THEMES[tKey];
                const isSelected = currentTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      setTheme(tKey);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-[#3e3e3e] text-white font-bold'
                        : 'text-[#b3b3b3] hover:bg-[#333333] hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: t.hex }}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Equalizer */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white transition-colors hidden sm:flex items-center justify-center"
          title="Audio Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Sleep Timer */}
        <button
          onClick={() => setIsSleepTimerOpen(true)}
          className={`p-2 rounded-full text-xs transition-colors flex items-center justify-center ${
            sleepTimerRemaining !== null
              ? `${theme.bgClass} text-black font-bold`
              : 'bg-[#232323] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreenOpen(true)}
          className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white transition-colors hidden sm:flex items-center justify-center"
          title="Full Screen View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Pill */}
        <div
          className="w-8 h-8 rounded-full bg-[#535353] hover:scale-105 flex items-center justify-center text-white cursor-pointer transition-transform shadow"
          title="dikshitmishra12@gmail.com"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
