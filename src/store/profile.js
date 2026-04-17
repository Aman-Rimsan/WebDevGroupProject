import { computed, ref } from 'vue';
import { loadJSON, saveJSON, postJSON } from '../api';

const STORAGE_KEY = 'spotifyClone.profile';

// Default shape - the old "favoriteSongs as title-artist string" format is discarded.
const DEFAULT_PROFILE = {
  favoriteSongIds:  [], // array of song IDs from the catalog
  favoriteArtists:  [], // array of artist name strings
};

// ── State ─────────────────────────────────────────────────────────────────────
export const profile = ref(loadJSON(STORAGE_KEY, DEFAULT_PROFILE));

// Migrate old format: if old `favoriteSongs` array exists, reset it.
if (Array.isArray(profile.value.favoriteSongs) && !Array.isArray(profile.value.favoriteSongIds)) {
  profile.value = {
    favoriteSongIds: [],
    favoriteArtists: Array.isArray(profile.value.favoriteArtists) ? profile.value.favoriteArtists : [],
  };
  saveJSON(STORAGE_KEY, profile.value);
}

// Ensure required fields exist
if (!Array.isArray(profile.value.favoriteSongIds))  profile.value.favoriteSongIds  = [];
if (!Array.isArray(profile.value.favoriteArtists))  profile.value.favoriteArtists  = [];

// ── Derived ───────────────────────────────────────────────────────────────────

/** Set of favorited song IDs for fast O(1) lookup. */
export const favoriteSongIds = computed(() => new Set(profile.value.favoriteSongIds));

/** Set of favorited artist names for fast O(1) lookup. */
export const favoriteArtistSet = computed(() => new Set(profile.value.favoriteArtists));

// ── Persistence ───────────────────────────────────────────────────────────────
function persist() {
  saveJSON(STORAGE_KEY, profile.value);
  postJSON('/api/profile', profile.value).catch(() => {});
}

// ── Public actions ────────────────────────────────────────────────────────────
export function loadProfile() {
  // Shape is already loaded from localStorage at module init; this is a no-op
  // helper so pages can call `loadProfile()` symmetrically with other stores.
  return profile.value;
}

export function toggleFavoriteSong(songId) {
  const list = profile.value.favoriteSongIds;
  const idx  = list.indexOf(songId);
  if (idx === -1) list.push(songId);
  else list.splice(idx, 1);
  persist();
}

export function removeFavoriteSong(songId) {
  profile.value.favoriteSongIds = profile.value.favoriteSongIds.filter(id => id !== songId);
  persist();
}

export function toggleFavoriteArtist(artistName) {
  const list = profile.value.favoriteArtists;
  const idx  = list.indexOf(artistName);
  if (idx === -1) list.push(artistName);
  else list.splice(idx, 1);
  persist();
}

export function removeFavoriteArtist(artistName) {
  profile.value.favoriteArtists = profile.value.favoriteArtists.filter(a => a !== artistName);
  persist();
}

export function addFavoriteArtist(artistName) {
  const name = artistName.trim();
  if (!name || profile.value.favoriteArtists.includes(name)) return;
  profile.value.favoriteArtists.push(name);
  persist();
}
