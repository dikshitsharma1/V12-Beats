import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'spotify_green';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  hex: string;
  bgClass: string;
  hoverBgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
  glowClass: string;
  gradientFrom: string;
  gradientTo: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-500',
    hoverBgClass: 'hover:bg-cyan-400',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500',
    ringClass: 'ring-cyan-500',
    glowClass: 'shadow-cyan-500/20',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
  },
  purple: {
    id: 'purple',
    name: 'Electric Purple',
    hex: '#a855f7',
    bgClass: 'bg-purple-500',
    hoverBgClass: 'hover:bg-purple-400',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500',
    ringClass: 'ring-purple-500',
    glowClass: 'shadow-purple-500/20',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-indigo-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Neon Mint',
    hex: '#10b981',
    bgClass: 'bg-emerald-500',
    hoverBgClass: 'hover:bg-emerald-400',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    ringClass: 'ring-emerald-500',
    glowClass: 'shadow-emerald-500/20',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500',
    hoverBgClass: 'hover:bg-amber-400',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    ringClass: 'ring-amber-500',
    glowClass: 'shadow-amber-500/20',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
  },
  rose: {
    id: 'rose',
    name: 'Hot Pink / Rose',
    hex: '#f43f5e',
    bgClass: 'bg-rose-500',
    hoverBgClass: 'hover:bg-rose-400',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500',
    ringClass: 'ring-rose-500',
    glowClass: 'shadow-rose-500/20',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-600',
  },
  spotify_green: {
    id: 'spotify_green',
    name: 'Spotify Classic',
    hex: '#1ed760',
    bgClass: 'bg-[#1ed760]',
    hoverBgClass: 'hover:bg-[#1fdf64]',
    textClass: 'text-[#1ed760]',
    borderClass: 'border-[#1ed760]',
    ringClass: 'ring-[#1ed760]',
    glowClass: 'shadow-[#1ed760]/20',
    gradientFrom: 'from-[#1ed760]',
    gradientTo: 'to-emerald-700',
  },
};

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (t: ThemeId) => void;
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('aurastream_theme') as ThemeId;
    return saved && THEMES[saved] ? saved : 'cyan'; // Cyan default for unique Spotify vibe
  });

  const setTheme = (t: ThemeId) => {
    setCurrentThemeState(t);
    localStorage.setItem('aurastream_theme', t);
  };

  const theme = THEMES[currentTheme] || THEMES.cyan;

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
