import { ref } from 'vue';
import { loadJSON, saveJSON, fetchPlaylists, apiCreatePlaylist, apiUpdatePlaylist, apiDeletePlaylist } from '../api';

const STORAGE_KEY = 'spotifyClone.playlists';

export const playlists = ref(loadJSON(STORAGE_KEY, []));
export const playlistsLoading = ref(false);
export const playlistsError = ref('');

function persist() {
  saveJSON(STORAGE_KEY, playlists.value);
}

function generateId() {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Sync with the server in the background; errors are non-fatal.
async function syncToServer(fn) {
  try {
    await fn();
  } catch (err) {
    console.error('Playlist sync failed:', err);
  }
}

export async function loadPlaylists() {
  playlistsLoading.value = true;
  playlistsError.value = '';
  try {
    playlists.value = await fetchPlaylists();
    persist();
  } catch (err) {
    console.error('Failed to load playlists:', err);
    playlistsError.value = 'Could not load playlists.';
  } finally {
    playlistsLoading.value = false;
  }
}

export async function createPlaylist(name) {
  const playlist = {
    id: generateId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    songIds: [],
  };
  playlists.value.push(playlist);
  persist();
  await syncToServer(() => apiCreatePlaylist(playlist));
  return playlist;
}

export async function deletePlaylist(id) {
  playlists.value = playlists.value.filter(p => p.id !== id);
  persist();
  await syncToServer(() => apiDeletePlaylist(id));
}

export async function addSongToPlaylist(playlistId, songId) {
  const pl = playlists.value.find(p => p.id === playlistId);
  if (!pl || pl.songIds.includes(String(songId))) return;
  pl.songIds.push(String(songId));
  persist();
  await syncToServer(() => apiUpdatePlaylist(playlistId, pl));
}

export async function removeSongFromPlaylist(playlistId, songId) {
  const pl = playlists.value.find(p => p.id === playlistId);
  if (!pl) return;
  pl.songIds = pl.songIds.filter(id => id !== String(songId));
  persist();
  await syncToServer(() => apiUpdatePlaylist(playlistId, pl));
}

export function getPlaylist(id) {
  return playlists.value.find(p => p.id === id) ?? null;
}
