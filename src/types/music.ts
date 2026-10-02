export type TrackSource = 'youtube' | 'local';

export interface Track {
  id: string;
  source: TrackSource;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  formattedDuration: string; // e.g. "3:45"
  thumbnail: string;
  views?: number;
  ago?: string;
  url?: string;
  localFileKey?: string; // key in IndexedDB for blob
  addedAt?: number;
  size?: number; // bytes for local files
  bitrate?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt?: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export type VisualizerMode = 'bars' | 'wave' | 'spectrum' | 'orb' | 'off';

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 10 band gains (-12dB to +12dB)
}

export interface PlayerState {
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
}
