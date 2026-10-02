import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// @ts-ignore - yt-search has no default type definitions
import yts from 'yt-search';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// YouTube search API endpoint
app.get('/api/search', async (req, res) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.json({ tracks: [] });
    }

    // Check if query is a direct YouTube URL or video ID
    const urlMatch = query.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = urlMatch ? urlMatch[1] : (query.length === 11 && !query.includes(' ') ? query : null);

    if (videoId) {
      try {
        const video = await yts({ videoId });
        if (video) {
          return res.json({
            tracks: [{
              id: video.videoId,
              source: 'youtube',
              title: video.title,
              artist: video.author?.name || 'YouTube Creator',
              duration: video.seconds || 0,
              formattedDuration: video.timestamp || '0:00',
              thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
              views: video.views,
              ago: video.ago || '',
              url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`
            }]
          });
        }
      } catch (err) {
        // Fall back to general search
      }
    }

    // Standard search query
    const results = await yts(query);
    const videos = (results.videos || []).slice(0, 30).map((v: any) => ({
      id: v.videoId,
      source: 'youtube',
      title: v.title,
      artist: v.author?.name || 'YouTube Creator',
      duration: v.seconds || 0,
      formattedDuration: v.timestamp || '0:00',
      thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      views: v.views,
      ago: v.ago || '',
      url: v.url
    }));

    res.json({ tracks: videos });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Search failed', message: error?.message || 'Unknown error' });
  }
});

// YouTube auto-complete query suggestions
app.get('/api/suggest', async (req, res) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.json({ suggestions: [] });
    }
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return res.json({ suggestions: [] });
    }
    const data = await response.json();
    const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    res.json({ suggestions: suggestions.slice(0, 8) });
  } catch {
    res.json({ suggestions: [] });
  }
});

// Curated music queries (Global + Indian Genres like Spotify)
const CURATED_QUERIES: Record<string, string> = {
  // Global Genres
  'trending': 'top hits music 2025 2026',
  'lofi': 'lofi hip hop radio beats to relax study to',
  'synthwave': 'synthwave chillwave 80s retro music',
  'indie': 'indie folk acoustic playlist relaxing',
  'rock': 'classic rock legendary hits',
  'electronic': 'melodic house edm chill electronic',
  'jazz': 'jazz cafe lounge relaxing instrumental',
  'classical': 'peaceful classical piano orchestra study',
  'gym': 'workout music high energy motivational',

  // Indian Music Genres (Spotify India style)
  'indian_trending': 'latest bollywood songs top trending hits 2025 2026',
  'bollywood_romance': 'romantic hindi songs arijit singh shreya ghoshal pritam best love songs',
  'punjabi_hits': 'punjabi hits diljit dosanjh karan aujla ap dhillon shubh top tracks',
  'desi_hiphop': 'desi hip hop divine seedhe maut krsna raftaar emiway dhh songs',
  'indian_indie': 'indian indie songs prateek kuhad anuv jain when chai met toast acoustic hindi',
  'sufi_ghazals': 'sufi songs rahat fateh ali khan nusrat jagjit singh ghazals sufi',
  'south_indian': 'south indian viral hits anirudh tamil telugu hits devi sri prasad ar rahman',
  'bollywood_nostalgia': '90s 2000s bollywood hits udit narayan alka yagnik sonu nigam kumar sanu kk',
  'bollywood_lofi': 'bollywood lofi chill beats hindi lofi songs playlist relaxing',
  'indian_devotional': 'shiva bhakti songs hanuman chalisa devotional peace morning bhajans',
  'classical_fusion': 'indian classical sitar flute fusion zakir hussain ravi shankar niladri kumar',
};

app.get('/api/curated', async (req, res) => {
  try {
    const genre = (req.query.genre as string || 'trending').toLowerCase();
    const query = CURATED_QUERIES[genre] || `${genre} music`;
    const results = await yts(query);
    const tracks = (results.videos || []).slice(0, 25).map((v: any) => ({
      id: v.videoId,
      source: 'youtube',
      title: v.title,
      artist: v.author?.name || 'YouTube Creator',
      duration: v.seconds || 0,
      formattedDuration: v.timestamp || '0:00',
      thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      views: v.views,
      ago: v.ago || '',
      url: v.url
    }));
    res.json({ tracks, genre });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch curated tracks', message: error?.message });
  }
});

// Smart AI / Heuristic Recommendations based on user history and mood genres
app.post('/api/recommendations', async (req, res) => {
  try {
    const { history = [], favorites = [], mood = 'chill', region = 'indian' } = req.body;

    const sampleTracks = [...favorites, ...history].slice(0, 10);
    const userArtists = Array.from(new Set(sampleTracks.map((t: any) => t.artist).filter(Boolean)));
    const userTitles = sampleTracks.map((t: any) => t.title).filter(Boolean);

    // Mood query mappings
    const MOOD_DESCRIPTORS: Record<string, string> = {
      'chill': 'relaxing peaceful acoustic calm vibes',
      'workout': 'high energy workout motivational gym cardio beat',
      'focus': 'study concentration instrumental deep focus ambient',
      'romance': 'romantic love soul heartfelt passionate',
      'melancholy': 'sad emotional heartbreak acoustic late night longing',
      'party': 'dance party club energetic bass remix banger',
      'monsoon_chai': 'rainy day cozy acoustic lofi soothing warm',
      'sufi_spiritual': 'sufi mystical soulful devotional spiritual peace',
      'desi_drill': 'hard desi hip hop drill pump trap energy'
    };

    const moodDesc = MOOD_DESCRIPTORS[mood] || 'feel good music';

    let searchQueries: string[] = [];

    // Attempt Gemini AI recommendation if API key available
    if (process.env.GEMINI_API_KEY && userArtists.length > 0) {
      try {
        const ai = new GoogleGenAI({});
        const prompt = `You are a world-class Spotify music recommendation algorithm.
A user has the following listening profile:
- Favorite & Recent Artists: ${userArtists.slice(0, 6).join(', ')}
- Sample Recent Tracks: ${userTitles.slice(0, 4).join(', ')}
- Current Mood: "${mood}" (${moodDesc})
- Musical Region/Preference: "${region}" (Indian & Desi, Bollywood, Punjabi, Indie, etc.)

Generate exactly 5 targeted search terms/queries (song title + artist, or artist + style) that this user would love right now matching this mood.
Respond with a JSON object containing an array of 5 query strings, for example:
{"queries": ["Arijit Singh romantic melodies", "Anuv Jain acoustic live", "Diljit Dosanjh chill vibe", "Prateek Kuhad cold mess style", "Pritam best love hits"]}`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(aiRes.text || '{}');
        if (Array.isArray(parsed.queries) && parsed.queries.length > 0) {
          searchQueries = parsed.queries;
        }
      } catch (geminiErr) {
        console.warn('Gemini recommendation notice, falling back to heuristics:', geminiErr);
      }
    }

    // Heuristic fallbacks if AI queries not generated
    if (searchQueries.length === 0) {
      if (region === 'indian') {
        if (userArtists.length > 0) {
          const topArtist = userArtists[0];
          searchQueries = [
            `${topArtist} ${moodDesc}`,
            `songs like ${topArtist} ${mood}`,
            `best ${mood} hindi indian songs 2025`,
            `indian indie ${moodDesc}`,
          ];
        } else {
          searchQueries = [
            `top bollywood ${moodDesc} songs`,
            `punjabi ${moodDesc} hits`,
            `indian indie acoustic ${mood}`,
            `hindi songs for ${mood}`,
          ];
        }
      } else {
        if (userArtists.length > 0) {
          const topArtist = userArtists[0];
          searchQueries = [
            `${topArtist} ${moodDesc}`,
            `tracks like ${topArtist}`,
            `best ${mood} music playlist`,
          ];
        } else {
          searchQueries = [
            `best ${moodDesc} tracks 2025`,
            `chill ${mood} vibes playlist`,
            `trending ${mood} songs`,
          ];
        }
      }
    }

    // Fetch tracks for generated queries concurrently
    const allTracks: any[] = [];
    const seenIds = new Set<string>();

    // Query YouTube for the top queries
    const searchPromises = searchQueries.slice(0, 4).map(async (q) => {
      try {
        const res = await yts(q);
        return (res.videos || []).slice(0, 6);
      } catch {
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    results.flat().forEach((v: any) => {
      if (v && v.videoId && !seenIds.has(v.videoId)) {
        seenIds.add(v.videoId);
        allTracks.push({
          id: v.videoId,
          source: 'youtube',
          title: v.title,
          artist: v.author?.name || 'YouTube Creator',
          duration: v.seconds || 0,
          formattedDuration: v.timestamp || '0:00',
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          views: v.views,
          ago: v.ago || '',
          url: v.url
        });
      }
    });

    res.json({
      recommendations: allTracks.slice(0, 30),
      mood,
      generatedBasedOn: userArtists.slice(0, 3),
      method: searchQueries.length > 0 && process.env.GEMINI_API_KEY ? 'gemini_ai' : 'pattern_heuristic'
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', message: error?.message });
  }
});

// Lyrics search endpoint (uses open LRCLIB)
app.get('/api/lyrics', async (req, res) => {
  try {
    const title = (req.query.title as string || '').trim();
    const artist = (req.query.artist as string || '').trim();
    if (!title) {
      return res.json({ lyrics: null });
    }

    const cleanTitle = title
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/(official\s+video|official\s+audio|lyrics|music\s+video|hd|4k)/gi, '')
      .trim();

    const cleanArtist = artist.replace(/vevo|official|channel/gi, '').trim();

    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'AuraStream-PrivatePlayer/1.0' } });

    if (response.ok) {
      const data = await response.json();
      return res.json({
        lyrics: data.plainLyrics || data.syncedLyrics || null,
        synced: !!data.syncedLyrics,
        syncedLyrics: data.syncedLyrics || null
      });
    }

    // Fallback: search lrclib
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'AuraStream-PrivatePlayer/1.0' } });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (Array.isArray(searchData) && searchData.length > 0) {
        const item = searchData[0];
        return res.json({
          lyrics: item.plainLyrics || item.syncedLyrics || null,
          synced: !!item.syncedLyrics,
          syncedLyrics: item.syncedLyrics || null
        });
      }
    }

    res.json({ lyrics: null });
  } catch {
    res.json({ lyrics: null });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AuraStream Music Engine' });
});

// Setup Vite middlewares or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraStream music server listening on port ${PORT}`);
  });
}

startServer();
