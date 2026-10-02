import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { AudioEngine } from '../utils/audioEngine';
import { Tv, X, Maximize2, Minimize2, Headphones, Play } from 'lucide-react';

export const YouTubePlayerDock: React.FC = () => {
  const { currentTrack, isPlaying, isVideoOpen, setIsVideoOpen, togglePlayPause } = useAudio();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      AudioEngine.getInstance().registerYouTubeIframe(iframeRef.current);
    }
  }, []);

  const hasYtTrack = currentTrack?.source === 'youtube';

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-out select-none ${
        isVideoOpen
          ? 'bottom-24 right-4 sm:right-8 w-80 sm:w-96 rounded-2xl shadow-2xl border border-zinc-800 bg-zinc-950 overflow-hidden'
          : hasYtTrack && !isMinimized
          ? 'bottom-22 right-4 w-48 sm:w-56 h-28 sm:h-32 rounded-xl shadow-xl border border-zinc-800/80 bg-zinc-950/95 overflow-hidden'
          : 'bottom-22 right-4 w-10 h-10 rounded-full overflow-hidden opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Bar for Expanded or Mini View */}
      {hasYtTrack && !isMinimized && (
        <div className="h-6 px-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5 truncate">
            {isVideoOpen ? (
              <Tv className="w-3 h-3 text-amber-400 shrink-0" />
            ) : (
              <Headphones className="w-3 h-3 text-amber-400 shrink-0" />
            )}
            <span className="truncate">{isVideoOpen ? 'Video Stream' : 'Audio Stream'}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsVideoOpen(!isVideoOpen)}
              className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-medium transition-colors"
              title={isVideoOpen ? 'Switch to Audio Mode' : 'Switch to Video Mode'}
            >
              {isVideoOpen ? 'Audio Mode' : 'Show Video'}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-0.5 text-zinc-500 hover:text-zinc-300"
              title="Minimize player dock"
            >
              <Minimize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Real YouTube IFrame Container */}
      <div className="w-full h-full relative bg-black aspect-video">
        <iframe
          ref={iframeRef}
          id="aura-active-yt-iframe"
          title="AuraStream Active YouTube Player"
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* When in Audio Mode (not isVideoOpen), display a sleek aesthetic vinyl cover over the iframe so video isn't distracting */}
        {hasYtTrack && !isVideoOpen && !isMinimized && (
          <div
            onClick={() => setIsVideoOpen(true)}
            className="absolute inset-0 bg-zinc-950/90 flex items-center justify-between p-2.5 cursor-pointer group transition-all"
            title="Click to view music video"
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover border border-zinc-800 shrink-0 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-zinc-200 block truncate group-hover:text-amber-400">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {currentTrack.artist}
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
              <Tv className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Restore Button if Minimized */}
      {hasYtTrack && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 right-4 z-40 p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-amber-400 shadow-xl hover:bg-zinc-800 transition-colors"
          title="Restore player dock"
        >
          <Headphones className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
