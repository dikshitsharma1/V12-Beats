import React, { useState, useEffect } from 'react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { SpotifyCard } from '../components/SpotifyCard';
import {
  Heart,
  Play,
  Pause,
  Sparkles,
  Flame,
  Radio,
  Music,
  Compass,
  Zap,
  Disc3,
  Loader2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const SpotifyHomeView: React.FC<{ onNavigateToSearch?: () => void }> = () => {
  const {
    favorites,
    history,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
  } = useAudio();
  const { theme } = useTheme();

  // Dynamic Spotify greeting
  const [greeting, setGreeting] = useState('Good evening');
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning');
    else if (hr < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Quick 6-pack tracks & sections
  const [quickTracks, setQuickTracks] = useState<Track[]>([]);
  const [madeForYouTracks, setMadeForYouTracks] = useState<Track[]>([]);
  const [indianHits, setIndianHits] = useState<Track[]>([]);
  const [punjabiHits, setPunjabiHits] = useState<Track[]>([]);
  const [indieHits, setIndieHits] = useState<Track[]>([]);
  const [popularArtists, setPopularArtists] = useState<
    { name: string; thumbnail: string; sampleId: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSpotifyHome() {
      try {
        setIsLoading(true);

        // Fetch curated sections concurrently
        const [trendingRes, romanceRes, punjabiRes, indieRes, recRes] = await Promise.all([
          fetch('/api/curated?genre=indian_trending'),
          fetch('/api/curated?genre=bollywood_romance'),
          fetch('/api/curated?genre=punjabi_hits'),
          fetch('/api/curated?genre=indian_indie'),
          fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              history: history.slice(0, 10),
              favorites: favorites.slice(0, 10),
              mood: 'chill',
              region: 'indian',
            }),
          }),
        ]);

        const [trendingData, romanceData, punjabiData, indieData, recData] = await Promise.all([
          trendingRes.ok ? trendingRes.json() : { tracks: [] },
          romanceRes.ok ? romanceRes.json() : { tracks: [] },
          punjabiRes.ok ? punjabiRes.json() : { tracks: [] },
          indieRes.ok ? indieRes.json() : { tracks: [] },
          recRes.ok ? recRes.json() : { recommendations: [] },
        ]);

        if (!isMounted) return;

        const allTrending = trendingData.tracks || [];
        setIndianHits(allTrending);
        setMadeForYouTracks(recData.recommendations?.length ? recData.recommendations : (romanceData.tracks || []));
        setPunjabiHits(punjabiData.tracks || []);
        setIndieHits(indieData.tracks || []);

        // Compose Quick 6-Pack
        const quick: Track[] = [];
        if (favorites.length > 0) {
          quick.push(favorites[0]);
        }
        if (allTrending.length > 0) quick.push(allTrending[0]);
        if (allTrending.length > 1) quick.push(allTrending[1]);
        if (romanceData.tracks?.length) quick.push(romanceData.tracks[0]);
        if (punjabiData.tracks?.length) quick.push(punjabiData.tracks[0]);
        if (indieData.tracks?.length) quick.push(indieData.tracks[0]);

        setQuickTracks(quick.slice(0, 6));

        // Artists section
        setPopularArtists([
          {
            name: 'Arijit Singh',
            thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
            sampleId: allTrending[0]?.id || 'H2f7MZaw3Yo',
          },
          {
            name: 'Diljit Dosanjh',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            sampleId: punjabiData.tracks?.[0]?.id || 'k4yXQkG2s1E',
          },
          {
            name: 'Shreya Ghoshal',
            thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
            sampleId: romanceData.tracks?.[0]?.id || 'H2f7MZaw3Yo',
          },
          {
            name: 'AP Dhillon',
            thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
            sampleId: punjabiData.tracks?.[1]?.id || 'k4yXQkG2s1E',
          },
          {
            name: 'Pritam',
            thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
            sampleId: allTrending[1]?.id || 'H2f7MZaw3Yo',
          },
          {
            name: 'Anuv Jain',
            thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
            sampleId: indieData.tracks?.[0]?.id || 'x3bfa3DZ8JM',
          },
        ]);
      } catch (e) {
        console.error('Error loading Spotify home data:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSpotifyHome();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickPlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track, quickTracks);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 text-white select-none">
      {/* Dynamic Ambient Gradient Top Banner */}
      <div className="relative -mt-6 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-8 pb-6 bg-gradient-to-b from-[#1e3a8a]/40 via-[#121212]/80 to-[#121212]">
        {/* Spotify Greeting Header */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-5 font-display">
          {greeting}
        </h1>

        {/* Spotify Signature Quick 6-Pack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Liked Songs Pinned Card */}
          <div
            onClick={() => {
              if (favorites.length > 0) {
                playTrack(favorites[0], favorites);
              }
            }}
            className="group relative flex items-center bg-[#282828]/70 hover:bg-[#383838] transition-all duration-300 rounded-md overflow-hidden cursor-pointer shadow-md pr-4"
          >
            <div
              className={`w-14 sm:w-16 h-14 sm:h-16 shrink-0 bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} flex items-center justify-center text-white shadow-md`}
            >
              <Heart className="w-6 h-6 fill-current text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm px-4 truncate flex-1 text-white">
              Liked Songs
            </span>
            {favorites.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(favorites[0], favorites);
                }}
                className={`w-10 h-10 rounded-full ${theme.bgClass} ${theme.hoverBgClass} text-black flex items-center justify-center shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shrink-0 hover:scale-105 active:scale-95`}
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            )}
          </div>

          {/* Quick Track Cards */}
          {quickTracks.slice(0, 5).map((track, idx) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => handleQuickPlay(track)}
                className="group relative flex items-center bg-[#282828]/70 hover:bg-[#383838] transition-all duration-300 rounded-md overflow-hidden cursor-pointer shadow-md pr-4"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-14 sm:w-16 h-14 sm:h-16 shrink-0 object-cover"
                />
                <span className="font-bold text-xs sm:text-sm px-4 truncate flex-1 text-white">
                  {track.title}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickPlay(track);
                  }}
                  className={`w-10 h-10 rounded-full ${theme.bgClass} ${theme.hoverBgClass} text-black flex items-center justify-center shadow-xl transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 ${
                    isThisPlaying
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
                >
                  {isThisPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
          <Loader2 className={`w-8 h-8 animate-spin ${theme.textClass}`} />
          <span className="text-xs">Loading Spotify recommendations...</span>
        </div>
      ) : (
        <>
          {/* SECTION 1: Made For You (Personalized Daily Mixes & Picks) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">
                  Made For You
                </h2>
                <p className="text-xs text-[#b3b3b3] mt-0.5">
                  Your personalized mixes, recent favorites, and taste profile
                </p>
              </div>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {madeForYouTracks.slice(0, 6).map((track, idx) => (
                <SpotifyCard
                  key={`mfy-${track.id}-${idx}`}
                  track={track}
                  playlistContext={madeForYouTracks}
                  subtitle={`Daily Mix ${idx + 1} · ${track.artist}`}
                />
              ))}
            </div>
          </div>

          {/* SECTION 2: Today's Biggest Indian Hits */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">
                  Today's Biggest Indian Hits
                </h2>
                <p className="text-xs text-[#b3b3b3] mt-0.5">
                  Top trending Bollywood, Punjabi, and Desi viral chartbusters
                </p>
              </div>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {indianHits.slice(0, 6).map((track, idx) => (
                <SpotifyCard
                  key={`ih-${track.id}-${idx}`}
                  track={track}
                  playlistContext={indianHits}
                />
              ))}
            </div>
          </div>

          {/* SECTION 3: Popular Artists (Circular Spotify Artist Cards) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">
                  Popular Artists
                </h2>
                <p className="text-xs text-[#b3b3b3] mt-0.5">
                  Top followed Indian and global creators
                </p>
              </div>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {popularArtists.map((artist, idx) => (
                <SpotifyCard
                  key={`artist-${idx}`}
                  track={{
                    id: artist.sampleId,
                    source: 'youtube',
                    title: artist.name,
                    artist: 'Artist',
                    duration: 0,
                    formattedDuration: 'Artist',
                    thumbnail: artist.thumbnail,
                  }}
                  isArtist
                  subtitle="Artist"
                />
              ))}
            </div>
          </div>

          {/* SECTION 4: Punjabi Heat */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">
                  Punjabi 101 & DHH
                </h2>
                <p className="text-xs text-[#b3b3b3] mt-0.5">
                  Bass-heavy beats from Diljit, Karan Aujla, AP Dhillon, and DIVINE
                </p>
              </div>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {punjabiHits.slice(0, 6).map((track, idx) => (
                <SpotifyCard
                  key={`pb-${track.id}-${idx}`}
                  track={track}
                  playlistContext={punjabiHits}
                />
              ))}
            </div>
          </div>

          {/* SECTION 5: Indie & Acoustic India */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">
                  Indie India & Coffeehouse
                </h2>
                <p className="text-xs text-[#b3b3b3] mt-0.5">
                  Gentle guitars, storytelling, and heartwarming acoustic melodies
                </p>
              </div>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {indieHits.slice(0, 6).map((track, idx) => (
                <SpotifyCard
                  key={`indie-${track.id}-${idx}`}
                  track={track}
                  playlistContext={indieHits}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
