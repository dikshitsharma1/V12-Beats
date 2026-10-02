import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { parseAndSaveAudioFile } from '../utils/localFiles';
import { UploadCloud, Folder, FileAudio, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';

export const LocalImportModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, refreshLocalTracks, localTracks, deleteLocalFile, playTrack } = useAudio();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [currentFileTitle, setCurrentFileTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isImportModalOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const audioFiles: File[] = [];
    const validExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lower = file.name.toLowerCase();
      if (file.type.startsWith('audio/') || validExtensions.some((ext) => lower.endsWith(ext))) {
        audioFiles.push(file);
      }
    }

    if (audioFiles.length === 0) {
      setErrorMessage('No valid audio files found (.mp3, .flac, .wav, .m4a, .ogg)');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setTotalToProcess(audioFiles.length);
    setProcessedCount(0);

    for (let i = 0; i < audioFiles.length; i++) {
      const f = audioFiles[i];
      setCurrentFileTitle(f.name);
      try {
        await parseAndSaveAudioFile(f);
      } catch (err: any) {
        console.error('Failed to import file:', f.name, err);
      }
      setProcessedCount(i + 1);
    }

    await refreshLocalTracks();
    setIsProcessing(false);
    setCurrentFileTitle('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const totalBytes = localTracks.reduce((acc, t) => acc + (t.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb >= 1000 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Local File Music Library</h2>
              <p className="text-xs text-zinc-400">
                IndexedDB Private Storage · {localTracks.length} tracks ({formatBytes(totalBytes)})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsImportModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
              : 'border-zinc-700/60 bg-zinc-950/40 hover:border-zinc-500 hover:bg-zinc-950/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
            <UploadCloud className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-sm font-semibold text-zinc-200">
            Click to browse or drop your audio files here
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Supports MP3, FLAC, WAV, AAC, M4A, OGG. Auto-extracts metadata & embedded album artwork.
          </p>

          <span className="mt-4 text-xs font-medium text-amber-400/90 underline decoration-amber-400/40 underline-offset-4">
            Select files from your device
          </span>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="truncate max-w-[320px]">Importing: {currentFileTitle}</span>
              <span className="font-mono tabular-nums font-medium text-amber-400">
                {processedCount} / {totalToProcess}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-200"
                style={{ width: `${(processedCount / totalToProcess) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Local Tracks Mini Preview & Manage */}
        {localTracks.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Recently Added Local Tracks</span>
              <span>{localTracks.length} Available Offline</span>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/60 divide-y divide-zinc-800/60">
              {localTracks.slice(0, 15).map((track) => (
                <div
                  key={track.id}
                  className="px-3 py-2 flex items-center justify-between hover:bg-zinc-800/40 transition-colors group"
                >
                  <div
                    onClick={() => {
                      playTrack(track, localTracks);
                      setIsImportModalOpen(false);
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-8 h-8 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 truncate">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLocalFile(track.id);
                      }}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                      title="Delete from local database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
