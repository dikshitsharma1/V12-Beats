import React from 'react';
import { useAudio } from '../context/AudioContext';
import { ListMusic, X, Trash2, Play, Music } from 'lucide-react';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-zinc-900/95 border-l border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <ListMusic className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Play Queue</h2>
          <span className="text-xs text-zinc-500 font-mono">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90 mb-2">
              Now Playing
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-100 truncate">
                  {currentTrack.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</div>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-amber-400">
                {currentTrack.formattedDuration}
              </span>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
            Next in Queue
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-2">
              <Music className="w-8 h-8 stroke-1 text-zinc-600" />
              <p className="text-xs">Your queue is empty</p>
              <p className="text-[11px] text-zinc-600">Search songs or play a playlist to add tracks</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                if (isCurrent) return null; // Already shown in Now Playing

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 group transition-colors"
                  >
                    <div
                      onClick={() => playTrack(track)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-[11px] font-mono text-zinc-500 w-4 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{track.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono tabular-nums text-zinc-500">
                        {track.formattedDuration}
                      </span>
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded transition-opacity"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
