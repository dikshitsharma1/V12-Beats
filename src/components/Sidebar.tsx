import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import {
  Compass,
  Search,
  Heart,
  Folder,
  History,
  Plus,
  Music,
  Trash2,
  ShieldCheck,
  Disc3,
  X,
  Flame,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedPlaylistId,
  setSelectedPlaylistId,
}) => {
  const {
    favorites,
    localTracks,
    playlists,
    createPlaylist,
    deletePlaylist,
    setIsImportModalOpen,
  } = useAudio();

  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = await createPlaylist(newPlaylistName, newPlaylistDesc);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreatingPlaylist(false);
    setSelectedPlaylistId(pl.id);
    setActiveTab('playlist');
  };

  const navItems = [
    { id: 'home', label: 'Resso Song Feed', icon: Disc3 },
    { id: 'indian', label: 'Desi & Indian Genres', icon: Flame },
    { id: 'recommendations', label: 'Made For You & Mood', icon: Sparkles },
    { id: 'explore', label: 'Explore & Curated', icon: Compass },
    { id: 'search', label: 'Search YouTube', icon: Search },
    { id: 'favorites', label: 'Liked Songs', count: favorites.length, icon: Heart },
    { id: 'local', label: 'Local Library', count: localTracks.length, icon: Folder },
    { id: 'history', label: 'Recently Played', icon: History },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-800/80 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20">
          <Disc3 className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-zinc-100 tracking-tight font-display">
            AuraStream
          </span>
          <span className="text-[10px] text-amber-400 font-medium">Ad-Free · Private</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-4 flex flex-col gap-1 border-b border-zinc-800/60">
        <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Menu
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedPlaylistId(null);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-amber-400' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-mono text-zinc-400">{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Playlists Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Playlists
          </span>
          <button
            onClick={() => setIsCreatingPlaylist(true)}
            className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded transition-colors"
            title="Create Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Playlist creation inline form */}
        {isCreatingPlaylist && (
          <form
            onSubmit={handleCreatePlaylist}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-2.5 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">New Playlist</span>
              <button
                type="button"
                onClick={() => setIsCreatingPlaylist(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors"
            >
              Create
            </button>
          </form>
        )}

        {/* Playlists list */}
        {playlists.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-zinc-600">
            No playlists yet. Click + to create one!
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {playlists.map((pl) => {
              const isSelected = activeTab === 'playlist' && selectedPlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    setActiveTab('playlist');
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Music className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{pl.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(pl.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Privacy & Local Storage Badge */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="text-zinc-300 font-medium block">100% Private Sandbox</span>
            <span className="text-zinc-500">Zero telemetry · Pure streaming</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
