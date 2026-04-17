import { ref } from 'vue';
import { loadJSON, saveJSON, fetchPlaylists, apiCreatePlaylist, apiUpdatePlaylist, apiDeletePlaylist } from '../api';

const STORAGE_KEY = 'spotifyClone.playlists';

// ── State ─────────────────────────────────────────────────────────────────────
export const playlists = ref(loadJSON(STORAGE_KEY, []));
export const playlistsLoading = ref(false);
export const playlistsError  = ref('');

// ── Helpers ───────────────────────────────────────────────────────────────────
function persist() {
  saveJSON(STORAGE_KEY, playlists.value);
}

function generateId() {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Actions ───────────────────────────────────────────────────────────────────

/** Load all playlists from the server (call once on app start or first use). */
export async function loadPlaylists() {
  playlistsLoading.value = true;
  playlistsError.value   = '';
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

/** Create a new playlist with a given name. Returns the new playlist object. */
export async function createPlaylist(name) {
  const playlist = {
    id:        generateId(),
    name:      name.trim(),
    createdAt: new Date().toISOString(),
    songIds:   [],
  };
  playlists.value.push(playlist);
  persist();
  try {
    await apiCreatePlaylist(playlist);
  } catch (err) {
    console.error('Failed to sync new playlist:', err);
  }
  return playlist;
}

/** Rename an existing playlist. */
export async function renamePlaylist(id, newName) {
  const pl = playlists.value.find(p => p.id === id);
  if (!pl) return;
  pl.name = newName.trim();
  persist();
  try {
    await apiUpdatePlaylist(id, pl);
  } catch (err) {
    console.error('Failed to sync rename:', err);
  }
}

/** Delete a playlist by id. */
export async function deletePlaylist(id) {
  playlists.value = playlists.value.filter(p => p.id !== id);
  persist();
  try {
    await apiDeletePlaylist(id);
  } catch (err) {
    console.error('Failed to sync delete:', err);
  }
}

/** Add a song ID to a playlist (no-op if already present). */
export async function addSongToPlaylist(playlistId, songId) {
  const pl = playlists.value.find(p => p.id === playlistId);
  if (!pl || pl.songIds.includes(String(songId))) return;
  pl.songIds.push(String(songId));
  persist();
  try {
    await apiUpdatePlaylist(playlistId, pl);
  } catch (err) {
    console.error('Failed to sync add song:', err);
  }
}

/** Remove a song ID from a playlist. */
export async function removeSongFromPlaylist(playlistId, songId) {
  const pl = playlists.value.find(p => p.id === playlistId);
  if (!pl) return;
  pl.songIds = pl.songIds.filter(id => id !== String(songId));
  persist();
  try {
    await apiUpdatePlaylist(playlistId, pl);
  } catch (err) {
    console.error('Failed to sync remove song:', err);
  }
}

/** Get a single playlist by id. */
export function getPlaylist(id) {
  return playlists.value.find(p => p.id === id) ?? null;
}
