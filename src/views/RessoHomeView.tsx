import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/localFiles';
import { AudioVisualizer } from '../components/AudioVisualizer';
import {
  Heart,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Mic2,
  Sliders,
  Moon,
  Plus,
  Tv,
  Share2,
  Sparkles,
  Flame,
  LayoutGrid,
  Disc3,
  Loader2,
  Volume2,
  VolumeX,
  Volume1,
  RotateCw,
  Zap,
  Coffee,
  Check,
} from 'lucide-react';

interface RessoChannel {
  id: string;
  name: string;
  icon: any;
  genreQuery?: string;
  mood?: string;
}

const RESSO_CHANNELS: RessoChannel[] = [
  { id: 'for_you', name: 'For You', icon: Sparkles },
  { id: 'desi_viral', name: 'Desi Viral', icon: Flame, genreQuery: 'indian_trending' },
  { id: 'bollywood_romance', name: 'Romance', icon: Heart, genreQuery: 'bollywood_romance' },
  { id: 'punjabi_beats', name: 'Punjabi', icon: Zap, genreQuery: 'punjabi_hits' },
  { id: 'indie_chai', name: 'Indie & Chai', icon: Coffee, genreQuery: 'indian_indie' },
  { id: 'chill_lofi', name: 'Lo-Fi Chill', icon: Moon, genreQuery: 'bollywood_lofi' },
];

const VIBE_TAGS = [
  '#MonsoonChai',
  '#LateNightDrive',
  '#SoulfulVibes',
  '#DesiHeat',
  '#HeartbreakMelody',
  '#PureAcoustic',
  '#NostalgiaTrip',
  '#FocusFlow',
  '#PunjabiBanger',
];

export const RessoHomeView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    isFavorite,
    toggleLike,
    addToQueue,
    playlists,
    addTrackToPlaylist,
    setIsEqualizerOpen,
    setIsSleepTimerOpen,
    sleepTimerRemaining,
    sleepAtTrackEnd,
    isVideoOpen,
    setIsVideoOpen,
    history,
    favorites,
  } = useAudio();

  // Mode: 'flow' (the signature full-screen Resso vertical feed) vs 'grid' (single songs grid)
  const [viewMode, setViewMode] = useState<'flow' | 'grid'>('flow');
  const [activeChannel, setActiveChannel] = useState('for_you');
  const [feedTracks, setFeedTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Kinetic Synced Lyrics state
  const [showLyricsOverlay, setShowLyricsOverlay] = useState(false);
  const [lyricsLines, setLyricsLines] = useState<{ time: number; text: string }[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  // Fetch single songs for the active Resso channel
  const fetchFeed = async (channelId: string) => {
    setIsLoading(true);
    try {
      if (channelId === 'for_you') {
        // Personalized recommendations based on history & favorites
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: history.slice(0, 15),
            favorites: favorites.slice(0, 15),
            mood: 'chill',
            region: 'indian',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const recs: Track[] = data.recommendations || [];
          setFeedTracks(recs);
          if (recs.length > 0 && !currentTrack) {
            playTrack(recs[0], recs);
            setCurrentTrackIndex(0);
          }
        }
      } else {
        const channel = RESSO_CHANNELS.find((c) => c.id === channelId);
        const query = channel?.genreQuery || 'indian_trending';
        const res = await fetch(`/api/curated?genre=${query}`);
        if (res.ok) {
          const data = await res.json();
          const trs: Track[] = data.tracks || [];
          setFeedTracks(trs);
          if (trs.length > 0 && !currentTrack) {
            playTrack(trs[0], trs);
            setCurrentTrackIndex(0);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching Resso feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeChannel);
  }, [activeChannel]);

  // Keep track of current index when playing from queue
  useEffect(() => {
    if (currentTrack && feedTracks.length > 0) {
      const idx = feedTracks.findIndex((t) => t.id === currentTrack.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      }
    }
  }, [currentTrack?.id, feedTracks]);

  // Load Synced Lyrics whenever current song changes
  useEffect(() => {
    if (!currentTrack) return;
    let isMounted = true;
    setIsLoadingLyrics(true);
    setLyricsLines([]);
    setPlainLyrics(null);

    fetch(`/api/lyrics?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.syncedLyrics) {
          const lines: { time: number; text: string }[] = [];
          const raw = (data.syncedLyrics as string).split('\n');
          for (const l of raw) {
            const match = l.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
            if (match) {
              const min = parseInt(match[1], 10);
              const sec = parseInt(match[2], 10);
              const ms = match[3] ? parseInt(match[3], 10) / (match[3].length === 2 ? 100 : 1000) : 0;
              const text = match[4].trim();
              if (text) lines.push({ time: min * 60 + sec + ms, text });
            }
          }
          setLyricsLines(lines);
        } else if (data.lyrics) {
          setPlainLyrics(data.lyrics);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  // Navigate to Next single song
  const handleNextSong = () => {
    if (feedTracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % feedTracks.length;
    setCurrentTrackIndex(nextIdx);
    playTrack(feedTracks[nextIdx], feedTracks);
  };

  // Navigate to Previous single song
  const handlePrevSong = () => {
    if (feedTracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + feedTracks.length) % feedTracks.length;
    setCurrentTrackIndex(prevIdx);
    playTrack(feedTracks[prevIdx], feedTracks);
  };

  // Keyboard navigation for vertical flow (ArrowUp / ArrowDown)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (viewMode === 'flow') {
        if (e.code === 'ArrowDown' || e.code === 'PageDown') {
          e.preventDefault();
          handleNextSong();
        } else if (e.code === 'ArrowUp' || e.code === 'PageUp') {
          e.preventDefault();
          handlePrevSong();
        }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [viewMode, currentTrackIndex, feedTracks]);

  // Find active lyric timestamp
  let activeLyricIndex = -1;
  if (lyricsLines.length > 0) {
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth scroll active lyric into view
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex]);

  const activeSong = currentTrack || (feedTracks[currentTrackIndex] ?? null);
  const isLiked = activeSong ? isFavorite(activeSong.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const vibeTag = VIBE_TAGS[(currentTrackIndex || 0) % VIBE_TAGS.length];

  const handleShare = () => {
    if (activeSong) {
      const url = activeSong.url || `https://www.youtube.com/watch?v=${activeSong.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-130px)] select-none">
      {/* Resso Top Channel Bar & View Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 gap-2 overflow-x-auto">
        {/* Resso Channel Tabs (For You, Desi, Punjabi, etc.) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {RESSO_CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 shadow-sm shadow-amber-400/25 scale-[1.02]'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{ch.name}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Flow (Resso Full Feed) vs Grid (Single Songs Grid) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('flow')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === 'flow'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Resso Full-Screen Vertical Song Flow"
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resso Flow</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Single Songs Cards Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Songs Grid</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SIGNATURE RESSO VERTICAL SONG FLOW */}
      {viewMode === 'flow' ? (
        <div
          ref={containerRef}
          className="relative flex-1 rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col justify-between bg-zinc-950 min-h-[520px] max-h-[780px]"
        >
          {/* Ambient Glowing Vibe Background */}
          {activeSong && (
            <>
              <div
                className="absolute inset-0 opacity-25 filter blur-3xl scale-125 transition-all duration-700 pointer-events-none"
                style={{
                  backgroundImage: `url(${activeSong.thumbnail})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />
            </>
          )}

          {/* Top Info Bar inside Resso Card */}
          <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase">
                {activeChannel === 'for_you' ? 'Personalized Match' : activeChannel.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                {vibeTag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Vibe / Lyrics toggle switch */}
              <button
                onClick={() => setShowLyricsOverlay(!showLyricsOverlay)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  showLyricsOverlay
                    ? 'bg-amber-400 text-zinc-950 font-semibold'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>{showLyricsOverlay ? 'Show Artwork' : 'Kinetic Lyrics'}</span>
              </button>

              <button
                onClick={() => fetchFeed(activeChannel)}
                className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                title="Refresh songs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Center Stage: Artwork / Spinning Vinyl OR Kinetic Synced Lyrics */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-12 my-auto overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-xs">Tuning into your Resso feed...</span>
              </div>
            ) : showLyricsOverlay ? (
              /* Resso Kinetic Lyrics Sheet */
              <div
                ref={lyricsContainerRef}
                className="w-full max-w-xl h-72 sm:h-80 overflow-y-auto px-4 flex flex-col gap-5 text-center scrollbar-none py-10"
              >
                {isLoadingLyrics ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    <span className="text-xs">Syncing lyrics...</span>
                  </div>
                ) : lyricsLines.length > 0 ? (
                  lyricsLines.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    const isPast = idx < activeLyricIndex;

                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLyricRef : null}
                        onClick={() => seek(line.time)}
                        className={`cursor-pointer transition-all duration-300 py-1 px-3 rounded-xl font-display ${
                          isActive
                            ? 'text-amber-300 text-xl sm:text-2xl font-extrabold scale-105 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                            : isPast
                            ? 'text-zinc-500 text-base hover:text-zinc-300'
                            : 'text-zinc-400 text-base hover:text-zinc-200'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })
                ) : (
                  <div className="whitespace-pre-line text-sm text-zinc-300 leading-relaxed font-medium my-auto">
                    {plainLyrics || 'Enjoying the beats. No lyrics found for this song.'}
                  </div>
                )}
              </div>
            ) : activeSong ? (
              /* Resso Artwork & Spinning Disc Visualizer */
              <div className="relative flex flex-col items-center justify-center gap-4">
                <div className="relative group cursor-pointer" onClick={togglePlayPause}>
                  <img
                    src={activeSong.thumbnail}
                    alt={activeSong.title}
                    className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-3xl shadow-2xl border border-zinc-800/80 transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Pulsing Audio Visualizer Ring behind artwork */}
                  <div className="absolute -inset-2 rounded-3xl bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Play / Pause Center Icon Overlay */}
                  <div className="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
                  </div>
                </div>

                {/* Sub-visualizer waveform line */}
                <AudioVisualizer height={32} className="w-64 h-8 rounded-lg opacity-80" />
              </div>
            ) : (
              <div className="text-zinc-500 text-xs">No tracks in feed</div>
            )}
          </div>

          {/* Bottom Area: Song Info & Floating Resso Actions Rail */}
          <div className="relative z-10 p-4 sm:p-8 flex items-end justify-between gap-4">
            {/* Left: Song Meta */}
            {activeSong && (
              <div className="min-w-0 max-w-lg flex flex-col gap-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold">
                    {activeSong.source === 'youtube' ? 'YouTube Stream' : 'Local File'}
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">{vibeTag}</span>
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight truncate font-display">
                  {activeSong.title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 truncate font-medium">
                  {activeSong.artist}
                </p>

                {/* Scrubber time bar inside Resso card */}
                <div className="flex items-center gap-3 pt-3 w-full max-w-md">
                  <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-8 text-right shrink-0">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 h-1.5 bg-zinc-800/80 rounded-full group cursor-pointer">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-amber-500 rounded-full group-hover:bg-amber-400 transition-all pointer-events-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.5"
                      value={currentTime}
                      onChange={(e) => seek(parseFloat(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-8 text-left shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            )}

            {/* Right: Floating Vertical Actions Rail (Signature Resso Feature) */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              {/* Previous Song */}
              <button
                onClick={handlePrevSong}
                className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg"
                title="Previous Song (Arrow Up)"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              {/* Like / Heart Button */}
              {activeSong && (
                <button
                  onClick={() => toggleLike(activeSong)}
                  className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all active:scale-90 shadow-xl ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 scale-105'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-rose-400 hover:border-rose-500/40'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like Song'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              )}

              {/* Kinetic Lyrics Overlay Toggle */}
              <button
                onClick={() => setShowLyricsOverlay(!showLyricsOverlay)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  showLyricsOverlay
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
                title="Toggle Lyrics"
              >
                <Mic2 className="w-4 h-4" />
              </button>

              {/* Add to Playlist button */}
              {activeSong && (
                <div className="relative">
                  <button
                    onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                    className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {showPlaylistMenu && (
                    <div className="absolute right-12 bottom-0 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 text-xs">
                      <span className="px-2 py-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                        Add to Playlist
                      </span>
                      {playlists.length === 0 ? (
                        <span className="px-2 py-1.5 text-zinc-500 text-[11px]">No playlists created</span>
                      ) : (
                        playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              addTrackToPlaylist(pl.id, activeSong);
                              setShowPlaylistMenu(false);
                            }}
                            className="px-2 py-1.5 rounded-lg text-left text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 text-xs truncate"
                          >
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Share / Copy Link */}
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
                title={copiedLink ? 'Copied!' : 'Share Song'}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Next Song Button (Primary Resso Navigation) */}
              <button
                onClick={handleNextSong}
                className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold flex items-center justify-center shadow-lg shadow-amber-400/25 transition-transform active:scale-95 animate-bounce"
                title="Next Song (Arrow Down)"
              >
                <ChevronDown className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: SINGLE SONGS GRID (Each card is an individual song, NOT a playlist!) */
        <div className="flex flex-col gap-4 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Single Songs Feed ({feedTracks.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Individual tracks curated for you — tap any song to play immediately
              </p>
            </div>
            <button
              onClick={() => fetchFeed(activeChannel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-amber-400"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-medium">Loading individual song cards...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
              {feedTracks.map((song, idx) => {
                const isThisPlaying = currentTrack?.id === song.id && isPlaying;
                const isThisCurrent = currentTrack?.id === song.id;
                const liked = isFavorite(song.id);
                const tag = VIBE_TAGS[idx % VIBE_TAGS.length];

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => {
                      playTrack(song, feedTracks);
                      setCurrentTrackIndex(idx);
                      setViewMode('flow');
                    }}
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isThisCurrent
                        ? 'border-amber-400/80 bg-zinc-900/90 ring-1 ring-amber-400/40'
                        : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {/* Artwork with 1-click play overlay */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-zinc-950">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
                          {isThisPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Vibe tag pill */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-semibold text-amber-300">
                        {tag}
                      </span>

                      {/* Duration */}
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 tabular-nums">
                        {song.formattedDuration}
                      </span>
                    </div>

                    {/* Single Song Details */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isThisCurrent ? 'text-amber-400' : 'text-zinc-100 group-hover:text-amber-300'
                          }`}
                        >
                          {song.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{song.artist}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song);
                        }}
                        className={`p-1 rounded-md shrink-0 transition-colors ${
                          liked ? 'text-rose-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
