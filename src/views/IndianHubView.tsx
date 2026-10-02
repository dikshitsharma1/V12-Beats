import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { TrackRow } from '../components/TrackRow';
import {
  Flame,
  Heart,
  Music,
  Radio,
  Sparkles,
  Zap,
  Moon,
  Compass,
  Play,
  Shuffle,
  Loader2,
  Disc3,
  Sun,
  Coffee,
} from 'lucide-react';

export interface IndianGenre {
  id: string;
  name: string;
  tagline: string;
  artists: string;
  icon: any;
  gradient: string;
  badgeColor: string;
}

export const INDIAN_GENRES: IndianGenre[] = [
  {
    id: 'bollywood_romance',
    name: 'Bollywood Romance',
    tagline: 'Heartfelt love anthems & soulful acoustic melodies',
    artists: 'Arijit Singh · Shreya Ghoshal · Pritam · Atif Aslam',
    icon: Heart,
    gradient: 'from-rose-600/30 via-red-900/20 to-zinc-900',
    badgeColor: 'text-rose-400 border-rose-500/30',
  },
  {
    id: 'punjabi_hits',
    name: 'Punjabi Pop & Beats',
    tagline: 'High-energy basslines, viral chartbusters & swagger',
    artists: 'Diljit Dosanjh · Karan Aujla · AP Dhillon · Shubh',
    icon: Zap,
    gradient: 'from-amber-600/30 via-yellow-900/20 to-zinc-900',
    badgeColor: 'text-amber-400 border-amber-500/30',
  },
  {
    id: 'desi_hiphop',
    name: 'Desi Hip Hop (DHH)',
    tagline: 'Raw street lyricism, drill rhythms & underground flow',
    artists: 'DIVINE · Seedhe Maut · KR$NA · Raftaar · MC Stan',
    icon: Flame,
    gradient: 'from-orange-600/30 via-stone-900/20 to-zinc-900',
    badgeColor: 'text-orange-400 border-orange-500/30',
  },
  {
    id: 'indian_indie',
    name: 'Indian Indie & Acoustic',
    tagline: 'Intimate storytelling, gentle guitars & coffeehouse vibes',
    artists: 'Prateek Kuhad · Anuv Jain · When Chai Met Toast · Taba Chake',
    icon: Coffee,
    gradient: 'from-emerald-600/30 via-teal-900/20 to-zinc-900',
    badgeColor: 'text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'sufi_ghazals',
    name: 'Sufi & Soulful Ghazals',
    tagline: 'Transcendent poetry, harmonium resonance & timeless Qawwali',
    artists: 'Nusrat Fateh Ali Khan · Rahat · Jagjit Singh · Abida Parveen',
    icon: Moon,
    gradient: 'from-violet-600/30 via-purple-900/20 to-zinc-900',
    badgeColor: 'text-violet-400 border-violet-500/30',
  },
  {
    id: 'bollywood_nostalgia',
    name: '90s & 2000s Nostalgia',
    tagline: 'The golden eras of melody, cassette memories & cinema magic',
    artists: 'Udit Narayan · Alka Yagnik · Kumar Sanu · Sonu Nigam · KK',
    icon: Disc3,
    gradient: 'from-pink-600/30 via-fuchsia-900/20 to-zinc-900',
    badgeColor: 'text-pink-400 border-pink-500/30',
  },
  {
    id: 'south_indian',
    name: 'South Indian Viral Hits',
    tagline: 'Electrifying Tamil, Telugu & Malayalam soundtracks & drops',
    artists: 'Anirudh Ravichander · AR Rahman · Devi Sri Prasad · Sushin Shyam',
    icon: Radio,
    gradient: 'from-cyan-600/30 via-blue-900/20 to-zinc-900',
    badgeColor: 'text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'bollywood_lofi',
    name: 'Bollywood Chill Lo-Fi',
    tagline: 'Slowed, reverbed & late-night chill study remixes',
    artists: 'Midnight Hindi Lo-Fi · Aesthetic Desi Beats · Rain Sounds',
    icon: Sparkles,
    gradient: 'from-indigo-600/30 via-blue-950/20 to-zinc-900',
    badgeColor: 'text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'indian_devotional',
    name: 'Bhakti & Spiritual Peace',
    tagline: 'Sacred chants, morning peace & meditative mantras',
    artists: 'Hanuman Chalisa · Shiva Stotram · Krishna Bhajans · Meditations',
    icon: Sun,
    gradient: 'from-amber-700/30 via-orange-950/20 to-zinc-900',
    badgeColor: 'text-amber-300 border-amber-500/30',
  },
  {
    id: 'classical_fusion',
    name: 'Classical & Sitar Fusion',
    tagline: 'Ragas, master tabla jugalbandi & progressive fusion',
    artists: 'Zakir Hussain · Ravi Shankar · Niladri Kumar · Anoushka Shankar',
    icon: Compass,
    gradient: 'from-slate-600/30 via-zinc-900/20 to-zinc-900',
    badgeColor: 'text-zinc-300 border-zinc-500/30',
  },
];

export const IndianHubView: React.FC = () => {
  const { playTrack } = useAudio();
  const [selectedGenreId, setSelectedGenreId] = useState('bollywood_romance');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeGenre = INDIAN_GENRES.find((g) => g.id === selectedGenreId) || INDIAN_GENRES[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/curated?genre=${selectedGenreId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setTracks(data.tracks || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching Indian genre tracks:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGenreId]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const ActiveIcon = activeGenre.icon;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Desi Music Universe · Spotify India Experience</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Indian Music & Genres
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
            Explore Bollywood romance, Punjabi bangers, Desi Hip Hop, Indie acoustic, Sufi poetry,
            and 90s nostalgia without ads.
          </p>
        </div>
      </div>

      {/* Spotify India Style Genre Grid Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
            Select a Genre Hub
          </h2>
          <span className="text-xs text-zinc-500">10 Curated Sub-Genres</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {INDIAN_GENRES.map((genre) => {
            const Icon = genre.icon;
            const isSelected = selectedGenreId === genre.id;

            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenreId(genre.id)}
                className={`relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-500/20 bg-zinc-900'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-lg bg-zinc-900/90 border flex items-center justify-center ${genre.badgeColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>

                <div className="relative z-10 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-amber-300 transition-colors">
                    {genre.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{genre.artists}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Genre Spotlight & Track List */}
      <div className="flex flex-col gap-4">
        {/* Spotlight Banner for Selected Genre */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-gradient-to-r ${activeGenre.gradient} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-zinc-900/90 border flex items-center justify-center shrink-0 shadow-lg ${activeGenre.badgeColor}`}
            >
              <ActiveIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Playing Genre
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeGenre.name}
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">{activeGenre.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-400/20 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Genre</span>
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 font-medium rounded-xl text-xs transition-colors border border-zinc-700/60"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs">Extracting {activeGenre.name} tracks from YouTube...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            No tracks found for this genre. Please try another!
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {tracks.map((track, idx) => (
              <TrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                playlistContext={tracks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
