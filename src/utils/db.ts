import { Track, Playlist } from '../types/music';

const DB_NAME = 'AuraStreamMusicDB';
const DB_VERSION = 2;

export interface DBLocalTrack {
  id: string;
  track: Track;
  audioBlob: Blob;
  addedAt: number;
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Audio files & local track records
      if (!db.objectStoreNames.contains('local_tracks')) {
        db.createObjectStore('local_tracks', { keyPath: 'id' });
      }

      // Playlists
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }

      // Favorites / Liked
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }

      // History
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' });
      }

      // Preferences / Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store a local track file
export async function saveLocalTrack(track: Track, audioBlob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('local_tracks', 'readwrite');
    const store = tx.objectStore('local_tracks');
    store.put({ id: track.id, track, audioBlob, addedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get all local tracks
export async function getAllLocalTracks(): Promise<Track[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('local_tracks', 'readonly');
    const store = tx.objectStore('local_tracks');
    const request = store.getAll();
    request.onsuccess = () => {
      const results: DBLocalTrack[] = request.result || [];
      // Sort newest first
      results.sort((a, b) => b.addedAt - a.addedAt);
      resolve(results.map((r) => r.track));
    };
    request.onerror = () => reject(request.error);
  });
}

// Get a local track audio blob
export async function getLocalTrackBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('local_tracks', 'readonly');
    const store = tx.objectStore('local_tracks');
    const request = store.get(id);
    request.onsuccess = () => {
      const res: DBLocalTrack | undefined = request.result;
      resolve(res ? res.audioBlob : null);
    };
    request.onerror = () => reject(request.error);
  });
}

// Delete a local track
export async function deleteLocalTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('local_tracks', 'readwrite');
    const store = tx.objectStore('local_tracks');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Favorites / Liked tracks
export async function getFavorites(): Promise<Track[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    const request = store.getAll();
    request.onsuccess = () => {
      const items: { id: string; track: Track; savedAt: number }[] = request.result || [];
      items.sort((a, b) => b.savedAt - a.savedAt);
      resolve(items.map((i) => i.track));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function toggleFavorite(track: Track): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('favorites', 'readwrite');
    const store = tx.objectStore('favorites');
    const getReq = store.get(track.id);

    getReq.onsuccess = () => {
      if (getReq.result) {
        store.delete(track.id);
        tx.oncomplete = () => resolve(false); // now unliked
      } else {
        store.put({ id: track.id, track, savedAt: Date.now() });
        tx.oncomplete = () => resolve(true); // now liked
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function isFavorite(trackId: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    const request = store.get(trackId);
    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
}

// Playlists
export async function getPlaylists(): Promise<Playlist[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readonly');
    const store = tx.objectStore('playlists');
    const request = store.getAll();
    request.onsuccess = () => {
      const list: Playlist[] = request.result || [];
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function savePlaylist(playlist: Playlist): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite');
    const store = tx.objectStore('playlists');
    store.put(playlist);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('playlists', 'readwrite');
    const store = tx.objectStore('playlists');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Listening History
export async function addToHistory(track: Track): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    store.put({ id: track.id, track, playedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getHistory(limit = 50): Promise<Track[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const request = store.getAll();
    request.onsuccess = () => {
      const list: { id: string; track: Track; playedAt: number }[] = request.result || [];
      list.sort((a, b) => b.playedAt - a.playedAt);
      resolve(list.slice(0, limit).map((i) => i.track));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearHistory(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
