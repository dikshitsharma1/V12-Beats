import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Mic2, Loader2, Sparkles } from 'lucide-react';

interface SyncedLine {
  time: number; // in seconds
  text: string;
}

export const LyricsModal: React.FC = () => {
  const { currentTrack, currentTime, isLyricsOpen, setIsLyricsOpen, seek } = useAudio();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [syncedLines, setSyncedLines] = useState<SyncedLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;

    let isMounted = true;
    setIsLoading(true);
    setLyrics(null);
    setSyncedLines([]);

    const fetchLyrics = async () => {
      try {
        const res = await fetch(
          `/api/lyrics?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(
            currentTrack.artist
          )}`
        );
        if (!res.ok) throw new Error('Lyrics fetch failed');
        const data = await res.json();

        if (!isMounted) return;

        if (data.syncedLyrics) {
          // Parse LRC format: [01:23.45] lyric line
          const lines: SyncedLine[] = [];
          const rawLines = (data.syncedLyrics as string).split('\n');
          for (const line of rawLines) {
            const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
            if (match) {
              const min = parseInt(match[1], 10);
              const sec = parseInt(match[2], 10);
              const ms = match[3] ? parseInt(match[3], 10) / (match[3].length === 2 ? 100 : 1000) : 0;
              const totalSec = min * 60 + sec + ms;
              const text = match[4].trim();
              if (text) {
                lines.push({ time: totalSec, text });
              }
            }
          }
          setSyncedLines(lines);
        } else if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics('No lyrics found for this track.');
        }
      } catch {
        if (isMounted) setLyrics('Could not retrieve lyrics. Enjoy the music!');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [isLyricsOpen, currentTrack?.id]);

  // Find active synced lyric index
  let activeIndex = -1;
  if (syncedLines.length > 0) {
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentTime >= syncedLines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[75vh] max-h-[640px] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
              <Mic2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {currentTrack?.title || 'Lyrics'}
              </h2>
              <p className="text-xs text-zinc-400 truncate">{currentTrack?.artist || 'Unknown Artist'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLyricsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Fetching verified lyrics...</span>
            </div>
          ) : syncedLines.length > 0 ? (
            <div className="flex flex-col gap-5 py-8">
              {syncedLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;

                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => seek(line.time)}
                    className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                      isActive
                        ? 'text-amber-400 text-xl font-bold scale-105 bg-amber-400/10'
                        : isPast
                        ? 'text-zinc-500 text-base hover:text-zinc-300'
                        : 'text-zinc-400 text-base hover:text-zinc-200'
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300 font-medium py-6 selection:bg-amber-500/30">
              {lyrics || 'No lyrics available for this song.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
