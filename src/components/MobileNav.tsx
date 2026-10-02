import React from 'react';
import { Home, Search, Library, Flame, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedPlaylistId: (id: string | null) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  setSelectedPlaylistId,
}) => {
  const { theme } = useTheme();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'favorites', label: 'Your Library', icon: Library },
    { id: 'indian', label: 'Desi Hits', icon: Flame },
    { id: 'recommendations', label: 'For You', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-20 left-0 right-0 h-14 bg-black/95 border-t border-zinc-900/80 backdrop-blur-xl flex items-center justify-around z-30 px-2 select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedPlaylistId(null);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? theme.textClass : ''}`} />
            <span className="text-[10px] tracking-tight mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
