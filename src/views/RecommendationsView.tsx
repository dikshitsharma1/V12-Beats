import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import {
  Sparkles,
  Play,
  Shuffle,
  RotateCw,
  Heart,
  Flame,
  Zap,
  Coffee,
  Moon,
  Compass,
  Radio,
  Loader2,
  Activity,
  Music2,
  Layers,
} from 'lucide-react';

interface MoodOption {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  accent: string;
}

const MOODS: MoodOption[] = [
  { id: 'monsoon_chai', name: 'Monsoon & Chai', subtitle: 'Warm acoustic & cozy rain beats', icon: Coffee, accent: 'text-amber-400 border-amber-500/30' },
  { id: 'chill', name: 'Late Night Chill', subtitle: 'Mellow lo-fi & peaceful ambient', icon: Moon, accent: 'text-indigo-400 border-indigo-500/30' },
  { id: 'workout', name: 'High Energy Workout', subtitle: 'Pump up gym beats & bass drops', icon: Zap, accent: 'text-orange-400 border-orange-500/30' },
  { id: 'romance', name: 'Soulful Romance', subtitle: 'Heartfelt love melodies & acoustic', icon: Heart, accent: 'text-rose-400 border-rose-500/30' },
  { id: 'melancholy', name: 'Deep Melancholy', subtitle: 'Emotional ballads & late night lyrics', icon: Activity, accent: 'text-blue-400 border-blue-500/30' },
  { id: 'party', name: 'Desi Club & Dance', subtitle: 'Heavy dhol, drill & party bangers', icon: Flame, accent: 'text-pink-400 border-pink-500/30' },
  { id: 'sufi_spiritual', name: 'Sufi & Spiritual', subtitle: 'Mystical Qawwali & meditation', icon: Sparkles, accent: 'text-violet-400 border-violet-500/30' },
  { id: 'focus', name: 'Deep Focus & Study', subtitle: 'Calm instrumental sitar & piano', icon: Compass, accent: 'text-emerald-400 border-emerald-500/30' },
];

export const RecommendationsView: React.FC = () => {
  const { history, favorites, playTrack } = useAudio();
  const [selectedMood, setSelectedMood] = useState('monsoon_chai');
  const [selectedRegion, setSelectedRegion] = useState<'indian' | 'all'>('indian');
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedArtists, setGeneratedArtists] = useState<string[]>([]);
  const [recMethod, setRecMethod] = useState<string>('');

  // Extract user listening pattern insights
  const allUserTracks = [...favorites, ...history];
  const artistCounts: Record<string, number> = {};
  allUserTracks.forEach((t) => {
    if (t.artist && t.artist !== 'Unknown Artist' && t.artist !== 'YouTube Creator') {
      artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
    }
  });

  const topUserArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((e) => e[0]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history.slice(0, 15),
          favorites: favorites.slice(0, 15),
          mood: selectedMood,
          region: selectedRegion,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setGeneratedArtists(data.generatedBasedOn || []);
        setRecMethod(data.method || '');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMood, selectedRegion]);

  const handlePlayAll = () => {
    if (recommendations.length > 0) {
      playTrack(recommendations[0], recommendations);
    }
  };

  const handleShufflePlay = () => {
    if (recommendations.length > 0) {
      const shuffled = [...recommendations].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const currentMoodObj = MOODS.find((m) => m.id === selectedMood) || MOODS[0];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Music Intelligence · Tailored to Your Taste</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Made For You & Mood Radar
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
            Smart song discovery analyzing your listening history, favorite artists, and real-time
            mood genres.
          </p>

          {/* User pattern tags */}
          {topUserArtists.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs text-zinc-400">
              <span className="text-zinc-500 font-medium">Your Top Artists:</span>
              {topUserArtists.map((artist, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 text-[11px]"
                >
                  {artist}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mood Dial & Flavor Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
              Select Your Mood & Vibe
            </h2>
            <p className="text-xs text-zinc-400">
              Suggestions adapt in real-time to your chosen emotional vibe
            </p>
          </div>

          {/* Region Flavor Toggle */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setSelectedRegion('indian')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedRegion === 'indian'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Indian / Desi
            </button>
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Global Mix
            </button>
          </div>
        </div>

        {/* Mood Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;

            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-zinc-900 border flex items-center justify-center shrink-0 ${mood.accent}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-amber-400' : 'text-zinc-200'
                    }`}
                  >
                    {mood.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{mood.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Songs List */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-200">
              {currentMoodObj.name} Recommendations
            </span>
            <span className="text-xs text-zinc-500">· {recommendations.length} tracks</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              disabled={recommendations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold rounded-xl text-xs transition-colors shadow-sm shadow-amber-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Play Mood Mix</span>
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={recommendations.length === 0}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800"
              title="Shuffle Mix"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition-colors"
              title="Refresh suggestions"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Track Rows */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-medium">
              Generating personalized tracks based on your listening pattern...
            </span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            No suggestions available right now. Click Refresh or try another mood!
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {recommendations.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                playlistContext={recommendations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
