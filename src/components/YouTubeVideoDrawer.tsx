import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { Tv, X, Minimize2, ExternalLink } from 'lucide-react';

export const YouTubeVideoDrawer: React.FC = () => {
  const { currentTrack, isVideoOpen, setIsVideoOpen } = useAudio();
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ytContainer = document.getElementById('aura-yt-player-container');
    if (!ytContainer) return;

    if (isVideoOpen && currentTrack?.source === 'youtube' && hostRef.current) {
      // Move YT container into the visible floating frame
      ytContainer.style.position = 'static';
      ytContainer.style.width = '100%';
      ytContainer.style.height = '100%';
      ytContainer.style.opacity = '1';
      ytContainer.style.pointerEvents = 'auto';
      hostRef.current.appendChild(ytContainer);
    } else {
      // Put YT container back into background
      ytContainer.style.position = 'fixed';
      ytContainer.style.top = '-9999px';
      ytContainer.style.left = '-9999px';
      ytContainer.style.width = '200px';
      ytContainer.style.height = '200px';
      ytContainer.style.opacity = '0';
      ytContainer.style.pointerEvents = 'none';
      document.body.appendChild(ytContainer);
    }

    return () => {
      // Ensure it returns to background when unmounted
      if (ytContainer) {
        ytContainer.style.position = 'fixed';
        ytContainer.style.top = '-9999px';
        ytContainer.style.left = '-9999px';
        ytContainer.style.width = '200px';
        ytContainer.style.height = '200px';
        ytContainer.style.opacity = '0';
        ytContainer.style.pointerEvents = 'none';
        document.body.appendChild(ytContainer);
      }
    };
  }, [isVideoOpen, currentTrack?.source]);

  if (!isVideoOpen || currentTrack?.source !== 'youtube') return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
      <div className="p-2.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 truncate">
          <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{currentTrack.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={`https://www.youtube.com/watch?v=${currentTrack.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-zinc-500 hover:text-zinc-200"
            title="Open in YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsVideoOpen(false)}
            className="p-1 text-zinc-500 hover:text-zinc-200"
            title="Close video view"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video host frame (16:9) */}
      <div className="w-full aspect-video bg-black flex items-center justify-center relative">
        <div ref={hostRef} className="w-full h-full flex items-center justify-center [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0" />
      </div>
    </div>
  );
};
