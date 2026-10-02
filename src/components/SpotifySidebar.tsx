import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Folder,
  Pin,
  ArrowRight,
  Music2,
  Trash2,
  Disc3,
  Sliders,
  Moon,
  Sparkles,
  Flame,
} from 'lucide-react';

interface SpotifySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  onOpenSearch: () => void;
}

export const SpotifySidebar: React.FC<SpotifySidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onOpenSearch,
}) => {
  const {
    favorites,
    localTracks,
    playlists,
    createPlaylist,
    deletePlaylist,
    setIsImportModalOpen,
  } = useAudio();
  const { theme } = useTheme();

  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'local'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = await createPlaylist(newPlaylistName.trim(), 'Created on Spotify AuraStream');
    setNewPlaylistName('');
    setIsCreating(false);
    setSelectedPlaylistId(pl.id);
    setActiveTab('playlist');
  };

  return (
    <aside className="w-72 bg-black flex flex-col gap-2 p-2 h-full select-none shrink-0 hidden md:flex text-[#b3b3b3]">
      {/* Box 1: Navigation Box */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 mb-1">
          <div
            className={`w-7 h-7 rounded-full ${theme.bgClass} flex items-center justify-center text-black shadow-md`}
          >
            <Disc3 className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white font-display">
            AuraStream
          </span>
          <span
            className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${theme.textClass} bg-[#282828]`}
          >
            Spotify UI
          </span>
        </div>

        {/* Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            setSelectedPlaylistId(null);
          }}
          className={`flex items-center gap-4 px-2 py-1.5 rounded-md font-bold text-sm transition-colors ${
            activeTab === 'home'
              ? 'text-white'
              : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-white' : ''}`} />
          <span>Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => {
            setActiveTab('search');
            setSelectedPlaylistId(null);
            onOpenSearch();
          }}
          className={`flex items-center gap-4 px-2 py-1.5 rounded-md font-bold text-sm transition-colors ${
            activeTab === 'search'
              ? 'text-white'
              : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Search className={`w-6 h-6 ${activeTab === 'search' ? 'text-white' : ''}`} />
          <span>Search</span>
        </button>
      </div>

      {/* Box 2: Your Library Box */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Library Header */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <button
            onClick={() => setLibraryFilter('all')}
            className="flex items-center gap-3 font-bold text-sm text-[#b3b3b3] hover:text-white transition-colors"
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="p-1.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
              title="Create playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-1.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
              title="Import local files"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setLibraryFilter(libraryFilter === 'playlists' ? 'all' : 'playlists')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              libraryFilter === 'playlists'
                ? 'bg-white text-black'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setLibraryFilter(libraryFilter === 'local' ? 'all' : 'local')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              libraryFilter === 'local'
                ? 'bg-white text-black'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Local Files ({localTracks.length})
          </button>
        </div>

        {/* Create playlist input form */}
        {isCreating && (
          <form onSubmit={handleCreatePlaylist} className="px-4 py-2 flex gap-1.5">
            <input
              type="text"
              autoFocus
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 bg-[#282828] border border-zinc-700 rounded-md px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className={`px-2.5 py-1 ${theme.bgClass} text-black font-bold text-xs rounded-md`}
            >
              Save
            </button>
          </form>
        )}

        {/* Scrollable Library List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1">
          {/* Liked Songs Item (Spotify Pinned Playlist) */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists') && (
            <div
              onClick={() => {
                setActiveTab('favorites');
                setSelectedPlaylistId(null);
              }}
              className={`group flex items-center gap-3 p-2 rounded-md hover:bg-[#232323] cursor-pointer transition-colors ${
                activeTab === 'favorites' ? 'bg-[#232323]' : ''
              }`}
            >
              <div
                className={`w-12 h-12 rounded bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} flex items-center justify-center shrink-0 shadow`}
              >
                <Heart className="w-5 h-5 fill-current text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-semibold truncate ${
                    activeTab === 'favorites' ? theme.textClass : 'text-white'
                  }`}
                >
                  Liked Songs
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] truncate mt-0.5">
                  <Pin className={`w-3 h-3 ${theme.textClass} shrink-0 fill-current`} />
                  <span>Playlist · {favorites.length} songs</span>
                </div>
              </div>
            </div>
          )}

          {/* Local Library Item */}
          {(libraryFilter === 'all' || libraryFilter === 'local') && (
            <div
              onClick={() => {
                setActiveTab('local');
                setSelectedPlaylistId(null);
              }}
              className={`group flex items-center gap-3 p-2 rounded-md hover:bg-[#232323] cursor-pointer transition-colors ${
                activeTab === 'local' ? 'bg-[#232323]' : ''
              }`}
            >
              <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center shrink-0 text-white">
                <Folder className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-semibold truncate ${
                    activeTab === 'local' ? theme.textClass : 'text-white'
                  }`}
                >
                  Local Files
                </div>
                <div className="text-xs text-[#b3b3b3] truncate mt-0.5">
                  Folder · {localTracks.length} tracks
                </div>
              </div>
            </div>
          )}

          {/* Custom Playlists */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists') &&
            playlists.map((pl) => {
              const isSelected = activeTab === 'playlist' && selectedPlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    setActiveTab('playlist');
                  }}
                  className={`group flex items-center gap-3 p-2 rounded-md hover:bg-[#232323] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#232323]' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center shrink-0 overflow-hidden">
                    {pl.coverArt ? (
                      <img src={pl.coverArt} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold truncate ${
                        isSelected ? theme.textClass : 'text-white'
                      }`}
                    >
                      {pl.name}
                    </div>
                    <div className="text-xs text-[#b3b3b3] truncate mt-0.5">
                      Playlist · {pl.tracks.length} songs
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(pl.id);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </aside>
  );
};
