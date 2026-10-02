import React from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import { History as HistoryIcon, Play, Trash2 } from 'lucide-react';
import { clearHistory } from '../utils/db';

export const HistoryView: React.FC = () => {
  const { history, playTrack, setVolume } = useAudio();

  const handleClearHistory = async () => {
    if (confirm('Clear your listening history?')) {
      await clearHistory();
      window.location.reload();
    }
  };

  const handlePlayAll = () => {
    if (history.length > 0) {
      playTrack(history[0], history);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Recently Played
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tracks you've streamed from YouTube or local files
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* History Track List */}
      {history.length === 0 ? (
        <div className="p-16 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/40">
          <HistoryIcon className="w-12 h-12 stroke-1 text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-200">No playback history yet</h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            Songs you listen to will automatically appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {history.map((track, idx) => (
            <TrackRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              playlistContext={history}
            />
          ))}
        </div>
      )}
    </div>
  );
};
