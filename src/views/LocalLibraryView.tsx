import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import {
  Folder,
  Upload,
  Play,
  Shuffle,
  Search,
  HardDrive,
  FileAudio,
} from 'lucide-react';

export const LocalLibraryView: React.FC = () => {
  const { localTracks, playTrack, setIsImportModalOpen } = useAudio();
  const [filterQuery, setFilterQuery] = useState('');

  const totalBytes = localTracks.reduce((acc, t) => acc + (t.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb >= 1000 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
  };

  const filteredTracks = localTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (t.album && t.album.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0], filteredTracks);
    }
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length > 0) {
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Local Audio Files
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Saved permanently in your browser IndexedDB · {localTracks.length} tracks (
              {formatBytes(totalBytes)})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl text-xs transition-colors shadow-sm shadow-emerald-500/20"
        >
          <Upload className="w-4 h-4" />
          <span>Import Audio Files</span>
        </button>
      </div>

      {/* Controls Bar & Filter */}
      {localTracks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-sm shadow-amber-400/20"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All</span>
            </button>
            <button
              onClick={handleShufflePlay}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl text-xs transition-colors border border-zinc-800"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search local songs..."
              className="w-full h-8 pl-8 pr-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Track List */}
      {localTracks.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
          <FileAudio className="w-12 h-12 stroke-1 text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-200">No local files imported yet</h2>
          <p className="text-xs text-zinc-400 max-w-sm">
            Drag and drop your MP3, FLAC, WAV, AAC, or M4A music files into the app to play them
            offline with full 10-band hardware equalizer and visualizer.
          </p>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded-xl text-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Select Local Audio Files</span>
          </button>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs">
          No local tracks match "{filterQuery}".
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              playlistContext={filteredTracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
