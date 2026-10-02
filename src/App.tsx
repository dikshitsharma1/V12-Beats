import React, { useState, useEffect } from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SpotifySidebar } from './components/SpotifySidebar';
import { SpotifyHeader } from './components/SpotifyHeader';
import { SpotifyPlayerBar } from './components/SpotifyPlayerBar';
import { SpotifyRightPanel } from './components/SpotifyRightPanel';
import { EqualizerModal } from './components/EqualizerModal';
import { LocalImportModal } from './components/LocalImportModal';
import { LyricsModal } from './components/LyricsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { NowPlayingFullscreen } from './components/NowPlayingFullscreen';
import { SleepTimerModal } from './components/SleepTimerModal';
import { YouTubePlayerDock } from './components/YouTubePlayerDock';
import { MobileNav } from './components/MobileNav';

import { SpotifyHomeView } from './views/SpotifyHomeView';
import { SpotifySearchView } from './views/SpotifySearchView';
import { IndianHubView } from './views/IndianHubView';
import { RecommendationsView } from './views/RecommendationsView';
import { ExploreView } from './views/ExploreView';
import { LocalLibraryView } from './views/LocalLibraryView';
import { FavoritesView } from './views/FavoritesView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { HistoryView } from './views/HistoryView';

import { parseAndSaveAudioFile } from './utils/localFiles';
import { UploadCloud } from 'lucide-react';

function SpotifyLayout() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    toggleLike,
    setIsFullscreenOpen,
    isFullscreenOpen,
    setIsEqualizerOpen,
    isEqualizerOpen,
    setIsQueueOpen,
    isQueueOpen,
    setIsSleepTimerOpen,
    isSleepTimerOpen,
    refreshLocalTracks,
  } = useAudio();

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    setTabHistory((prev) => [...prev, nextTab]);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHist = [...tabHistory];
      newHist.pop();
      const prevTab = newHist[newHist.length - 1];
      setTabHistory(newHist);
      setActiveTab(prevTab);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyL':
          if (currentTrack) toggleLike(currentTrack);
          break;
        case 'KeyF':
          setIsFullscreenOpen(!isFullscreenOpen);
          break;
        case 'KeyE':
          setIsEqualizerOpen(!isEqualizerOpen);
          break;
        case 'KeyQ':
          setIsQueueOpen(!isQueueOpen);
          break;
        case 'KeyT':
          setIsSleepTimerOpen(!isSleepTimerOpen);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTrack,
    volume,
    currentTime,
    isPlaying,
    isFullscreenOpen,
    isEqualizerOpen,
    isQueueOpen,
    isSleepTimerOpen,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    toggleLike,
    setIsFullscreenOpen,
    setIsEqualizerOpen,
    setIsQueueOpen,
    setIsSleepTimerOpen,
  ]);

  // Window drag & drop for audio files
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
          if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
            await parseAndSaveAudioFile(file);
          }
        }
        await refreshLocalTracks();
        setActiveTab('local');
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [refreshLocalTracks]);

  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    setActiveTab('search');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-[#b3b3b3] select-none">
      {/* Drag & Drop Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-cyan-400 p-8 text-center animate-in fade-in duration-150">
          <UploadCloud className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white">Drop Audio Files to Import into Spotify Library</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Audio files will be safely stored and indexed into your private library.
          </p>
        </div>
      )}

      {/* Main 3-Column Spotify Desktop Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Spotify Library & Nav Sidebar */}
        <SpotifySidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          selectedPlaylistId={selectedPlaylistId}
          setSelectedPlaylistId={setSelectedPlaylistId}
          onOpenSearch={() => setActiveTab('search')}
        />

        {/* Center Column: Main Content Container (Rounded Spotify #121212 Canvas) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#121212] rounded-lg m-2 ml-0 overflow-hidden relative shadow-2xl">
          {/* Spotify Sticky Header */}
          <SpotifyHeader
            onSearchSubmit={handleSearchSubmit}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            canGoBack={tabHistory.length > 1}
            onGoBack={handleGoBack}
          />

          {/* Scrollable View Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 pb-24 md:pb-12">
            {activeTab === 'home' && (
              <SpotifyHomeView onNavigateToSearch={() => setActiveTab('search')} />
            )}
            {activeTab === 'search' && (
              <SpotifySearchView initialQuery={searchQuery} />
            )}
            {activeTab === 'indian' && <IndianHubView />}
            {activeTab === 'recommendations' && <RecommendationsView />}
            {activeTab === 'explore' && <ExploreView />}
            {activeTab === 'local' && <LocalLibraryView />}
            {activeTab === 'favorites' && <FavoritesView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'playlist' && selectedPlaylistId && (
              <PlaylistDetailView
                playlistId={selectedPlaylistId}
                onBack={() => setActiveTab('home')}
              />
            )}
          </main>
        </div>

        {/* Right Column: Spotify "Now Playing View" Panel */}
        <SpotifyRightPanel
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
        />
      </div>

      {/* Modals & Tools */}
      <EqualizerModal />
      <LocalImportModal />
      <LyricsModal />
      <QueueDrawer />
      <SleepTimerModal />
      <NowPlayingFullscreen />
      <YouTubePlayerDock />

      {/* Mobile Navigation Tabs */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setSelectedPlaylistId={setSelectedPlaylistId}
      />

      {/* Persistent Bottom Spotify Player Bar */}
      <SpotifyPlayerBar
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <SpotifyLayout />
      </AudioProvider>
    </ThemeProvider>
  );
}
