import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, RepeatMode, VisualizerMode } from '../types/music';
import { AudioEngine } from '../utils/audioEngine';
import {
  getFavorites,
  toggleFavorite,
  getPlaylists,
  savePlaylist,
  deletePlaylist as dbDeletePlaylist,
  getAllLocalTracks,
  deleteLocalTrack as dbDeleteLocalTrack,
  addToHistory,
  getHistory,
} from '../utils/db';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  queueIndex: number;

  favorites: Track[];
  playlists: Playlist[];
  localTracks: Track[];
  history: Track[];

  isFavorite: (id: string) => boolean;
  toggleLike: (track: Track) => Promise<void>;

  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  refreshLocalTracks: () => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description: string) => Promise<Playlist>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  deleteLocalFile: (id: string) => Promise<void>;

  // UI state toggles
  isEqualizerOpen: boolean;
  setIsEqualizerOpen: (v: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (v: boolean) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (v: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (v: boolean) => void;
  isFullscreenOpen: boolean;
  setIsFullscreenOpen: (v: boolean) => void;
  isVideoOpen: boolean;
  setIsVideoOpen: (v: boolean) => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;

  // Sleep Timer
  isSleepTimerOpen: boolean;
  setIsSleepTimerOpen: (v: boolean) => void;
  sleepTimerRemaining: number | null; // seconds
  sleepAtTrackEnd: boolean;
  startSleepTimer: (minutes: number) => void;
  toggleSleepAtTrackEnd: () => void;
  cancelSleepTimer: () => void;
  extendSleepTimer: (extraMinutes: number) => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // UI controls
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');

  // Sleep timer state
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [sleepAtTrackEnd, setSleepAtTrackEnd] = useState(false);
  const originalVolumeRef = useRef(volume);

  const queueRef = useRef(queue);
  queueRef.current = queue;
  const queueIndexRef = useRef(queueIndex);
  queueIndexRef.current = queueIndex;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const isShuffledRef = useRef(isShuffled);
  isShuffledRef.current = isShuffled;
  const sleepAtTrackEndRef = useRef(sleepAtTrackEnd);
  sleepAtTrackEndRef.current = sleepAtTrackEnd;

  // Initialize engine and load DB
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engineRef.current = engine;

    engine.onTimeUpdate((cur, dur) => {
      setCurrentTime(cur);
      if (dur > 0) setDuration(dur);
    });

    engine.onStateChange((playing, buffering) => {
      setIsPlaying(playing);
      setIsBuffering(buffering);
    });

    engine.onTrackEnd(() => {
      handleTrackEnd();
    });

    // Load initial data
    refreshLocalTracks();
    refreshPlaylists();
    getFavorites().then(setFavorites).catch(console.error);
    getHistory().then(setHistory).catch(console.error);
  }, []);

  // Sleep timer countdown ticker (1-second precision)
  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      // Timer finished - pause playback
      engineRef.current?.pause();
      setIsPlaying(false);
      setSleepTimerRemaining(null);
      // Restore original volume
      engineRef.current?.setVolume(originalVolumeRef.current);
      return;
    }

    // Soft fade-out over last 15 seconds
    if (sleepTimerRemaining <= 15) {
      const fadeFraction = sleepTimerRemaining / 15;
      engineRef.current?.setVolume(originalVolumeRef.current * fadeFraction);
    }

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const handleTrackEnd = () => {
    if (sleepAtTrackEndRef.current) {
      engineRef.current?.pause();
      setIsPlaying(false);
      setSleepAtTrackEnd(false);
      return;
    }

    const rMode = repeatModeRef.current;
    if (rMode === 'one' && currentTrack) {
      engineRef.current?.seek(0);
      engineRef.current?.resume();
      return;
    }

    const currentQueue = queueRef.current;
    const curIdx = queueIndexRef.current;

    if (curIdx < currentQueue.length - 1) {
      playTrackByIndex(curIdx + 1);
    } else if (rMode === 'all' && currentQueue.length > 0) {
      playTrackByIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  const refreshLocalTracks = async () => {
    try {
      const tracks = await getAllLocalTracks();
      setLocalTracks(tracks);
    } catch (e) {
      console.error('Error fetching local tracks:', e);
    }
  };

  const refreshPlaylists = async () => {
    try {
      const list = await getPlaylists();
      setPlaylists(list);
    } catch (e) {
      console.error('Error fetching playlists:', e);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const toggleLike = async (track: Track) => {
    try {
      const liked = await toggleFavorite(track);
      if (liked) {
        setFavorites((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
      } else {
        setFavorites((prev) => prev.filter((t) => t.id !== track.id));
      }
    } catch (e) {
      console.error('Toggle favorite error:', e);
    }
  };

  const playTrackByIndex = async (index: number) => {
    const track = queueRef.current[index];
    if (!track) return;
    setQueueIndex(index);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 0);
    setIsPlaying(true);

    try {
      await engineRef.current?.playTrack(track);
      addToHistory(track).catch(console.error);
      getHistory().then(setHistory).catch(console.error);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    let finalQueue = newQueue || queue;
    let targetIndex = 0;

    if (newQueue) {
      setQueue(newQueue);
      targetIndex = newQueue.findIndex((t) => t.id === track.id);
      if (targetIndex === -1) targetIndex = 0;
    } else {
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx !== -1) {
        targetIndex = existingIdx;
      } else {
        finalQueue = [...queue, track];
        setQueue(finalQueue);
        targetIndex = finalQueue.length - 1;
      }
    }

    setQueueIndex(targetIndex);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 0);
    setIsPlaying(true);

    try {
      await engineRef.current?.playTrack(track);
      addToHistory(track).catch(console.error);
      getHistory().then(setHistory).catch(console.error);
    } catch (err) {
      console.error('Failed to play track:', err);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrackByIndex(0);
      }
      return;
    }

    if (isPlaying) {
      engineRef.current?.pause();
      setIsPlaying(false);
    } else {
      engineRef.current?.resume();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    if (isShuffledRef.current) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      playTrackByIndex(nextIdx);
      return;
    }

    if (queueIndex < queue.length - 1) {
      playTrackByIndex(queueIndex + 1);
    } else if (repeatMode === 'all') {
      playTrackByIndex(0);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (queueIndex > 0) {
      playTrackByIndex(queueIndex - 1);
    } else {
      seek(0);
    }
  };

  const seek = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return;
    setCurrentTime(seconds);
    engineRef.current?.seek(seconds);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    originalVolumeRef.current = v;
    setIsMuted(false);
    engineRef.current?.setVolume(v);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    engineRef.current?.setMute(nextMuted);
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    engineRef.current?.setPlaybackRate(rate);
  };

  const toggleRepeat = () => {
    setRepeatMode((cur) => {
      if (cur === 'off') return 'all';
      if (cur === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
    if (index < queueIndex) {
      setQueueIndex((idx) => idx - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  const createPlaylist = async (name: string, description: string): Promise<Playlist> => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Playlist',
      description: description.trim(),
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await savePlaylist(newPl);
    await refreshPlaylists();
    return newPl;
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    if (pl.tracks.some((t) => t.id === track.id)) return;

    const updated: Playlist = {
      ...pl,
      tracks: [...pl.tracks, track],
      coverArt: pl.coverArt || track.thumbnail,
      updatedAt: Date.now(),
    };
    await savePlaylist(updated);
    await refreshPlaylists();
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated: Playlist = {
      ...pl,
      tracks: pl.tracks.filter((t) => t.id !== trackId),
      updatedAt: Date.now(),
    };
    await savePlaylist(updated);
    await refreshPlaylists();
  };

  const deletePlaylist = async (playlistId: string) => {
    await dbDeletePlaylist(playlistId);
    await refreshPlaylists();
  };

  const deleteLocalFile = async (id: string) => {
    await dbDeleteLocalTrack(id);
    await refreshLocalTracks();
    if (currentTrack?.id === id) {
      engineRef.current?.pause();
      setCurrentTrack(null);
    }
  };

  // Sleep Timer functions
  const startSleepTimer = (minutes: number) => {
    setSleepAtTrackEnd(false);
    originalVolumeRef.current = volume;
    setSleepTimerRemaining(minutes * 60);
  };

  const toggleSleepAtTrackEnd = () => {
    setSleepTimerRemaining(null);
    setSleepAtTrackEnd((prev) => !prev);
  };

  const cancelSleepTimer = () => {
    setSleepTimerRemaining(null);
    setSleepAtTrackEnd(false);
    engineRef.current?.setVolume(originalVolumeRef.current);
  };

  const extendSleepTimer = (extraMinutes: number) => {
    setSleepTimerRemaining((prev) => (prev !== null ? prev + extraMinutes * 60 : extraMinutes * 60));
  };

  return (
    <AudioCtx.Provider
      value={{
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
        queue,
        queueIndex,
        favorites,
        playlists,
        localTracks,
        history,
        isFavorite,
        toggleLike,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        setPlaybackRate,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        refreshLocalTracks,
        refreshPlaylists,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        deleteLocalFile,
        isEqualizerOpen,
        setIsEqualizerOpen,
        isQueueOpen,
        setIsQueueOpen,
        isLyricsOpen,
        setIsLyricsOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        isFullscreenOpen,
        setIsFullscreenOpen,
        isVideoOpen,
        setIsVideoOpen,
        visualizerMode,
        setVisualizerMode,
        isSleepTimerOpen,
        setIsSleepTimerOpen,
        sleepTimerRemaining,
        sleepAtTrackEnd,
        startSleepTimer,
        toggleSleepAtTrackEnd,
        cancelSleepTimer,
        extendSleepTimer,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioCtx);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
