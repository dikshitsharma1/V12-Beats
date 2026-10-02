import * as mm from 'music-metadata-browser';
import { Track } from '../types/music';
import { saveLocalTrack } from './db';

// Format seconds to mm:ss or hh:mm:ss
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Generate fallback SVG cover art with nice dark aesthetic and title
export function generateCoverArt(title: string, artist: string): string {
  const hash = (title + artist).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [
    ['#3b82f6', '#1d4ed8'],
    ['#8b5cf6', '#6d28d9'],
    ['#ec4899', '#be185d'],
    ['#f59e0b', '#b45309'],
    ['#10b981', '#047857'],
    ['#06b6d4', '#0e7490'],
  ];
  const [col1, col2] = hues[hash % hues.length];
  const initial = (title[0] || 'M').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${col1}" />
        <stop offset="100%" stop-color="${col2}" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#grad)" />
    <circle cx="150" cy="150" r="105" fill="#18181b" opacity="0.85" />
    <circle cx="150" cy="150" r="75" fill="none" stroke="#27272a" stroke-width="2" />
    <circle cx="150" cy="150" r="50" fill="none" stroke="#27272a" stroke-width="1.5" />
    <circle cx="150" cy="150" r="28" fill="${col1}" />
    <circle cx="150" cy="150" r="6" fill="#09090b" />
    <text x="150" y="270" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="16" opacity="0.95">${escapeXml(title.slice(0, 22))}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Parse single audio file and store in DB
export async function parseAndSaveAudioFile(file: File): Promise<Track> {
  const fileId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Default fallback info from filename
  const rawName = file.name.replace(/\.[^/.]+$/, '');
  let extractedTitle = rawName;
  let extractedArtist = 'Local Artist';

  if (rawName.includes(' - ')) {
    const parts = rawName.split(' - ');
    extractedArtist = parts[0].trim();
    extractedTitle = parts.slice(1).join(' - ').trim();
  }

  let duration = 0;
  let thumbnail = '';
  let album = '';
  let bitrate = 0;

  try {
    const metadata = await mm.parseBlob(file);
    if (metadata.common.title) {
      extractedTitle = metadata.common.title;
    }
    if (metadata.common.artist) {
      extractedArtist = metadata.common.artist;
    }
    if (metadata.common.album) {
      album = metadata.common.album;
    }
    if (metadata.format.duration) {
      duration = Math.round(metadata.format.duration);
    }
    if (metadata.format.bitrate) {
      bitrate = Math.round(metadata.format.bitrate / 1000);
    }

    // Extract cover image
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      const blob = new Blob([new Uint8Array(pic.data) as any], { type: pic.format });
      thumbnail = URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn('Metadata parse error, falling back to audio duration detection:', err);
  }

  // If duration still unknown, get it through HTMLAudioElement
  if (duration === 0) {
    try {
      duration = await getAudioDuration(file);
    } catch {
      duration = 0;
    }
  }

  if (!thumbnail) {
    thumbnail = generateCoverArt(extractedTitle, extractedArtist);
  }

  const track: Track = {
    id: fileId,
    source: 'local',
    title: extractedTitle,
    artist: extractedArtist,
    album: album || 'Local Audio',
    duration,
    formattedDuration: formatTime(duration),
    thumbnail,
    addedAt: Date.now(),
    size: file.size,
    bitrate
  };

  await saveLocalTrack(track, file);
  return track;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.remove();
    };

    audio.onloadedmetadata = () => {
      const d = Math.round(audio.duration || 0);
      cleanup();
      resolve(d);
    };

    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
  });
}
