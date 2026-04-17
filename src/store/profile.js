import { computed, ref } from 'vue';
import { loadJSON, saveJSON, postJSON } from '../api';

const STORAGE_KEY = 'spotifyClone.profile';

const DEFAULT_PROFILE = {
  favoriteSongIds: [],
  favoriteArtists: [],
};

export const profile = ref(loadJSON(STORAGE_KEY, DEFAULT_PROFILE));

// Migrate from the old format where songs were stored as "Title - Artist" strings.
if (Array.isArray(profile.value.favoriteSongs) && !Array.isArray(profile.value.favoriteSongIds)) {
  profile.value = {
    favoriteSongIds: [],
    favoriteArtists: Array.isArray(profile.value.favoriteArtists) ? profile.value.favoriteArtists : [],
  };
  saveJSON(STORAGE_KEY, profile.value);
}

if (!Array.isArray(profile.value.favoriteSongIds)) profile.value.favoriteSongIds = [];
if (!Array.isArray(profile.value.favoriteArtists)) profile.value.favoriteArtists = [];

// Set of favourited song IDs for O(1) lookup.
export const favoriteSongIds = computed(() => new Set(profile.value.favoriteSongIds));

function persist() {
  saveJSON(STORAGE_KEY, profile.value);
  postJSON('/api/profile', profile.value).catch(() => {});
}

// No-op helper so pages can call loadProfile() symmetrically with other stores.
export function loadProfile() {
  return profile.value;
}

function toggleInArray(arr, item) {
  const idx = arr.indexOf(item);
  if (idx === -1) arr.push(item);
  else arr.splice(idx, 1);
}

export function toggleFavoriteSong(songId) {
  toggleInArray(profile.value.favoriteSongIds, songId);
  persist();
}

export function removeFavoriteSong(songId) {
  profile.value.favoriteSongIds = profile.value.favoriteSongIds.filter(id => id !== songId);
  persist();
}

export function addFavoriteArtist(artistName) {
  const name = artistName.trim();
  if (!name || profile.value.favoriteArtists.includes(name)) return;
  profile.value.favoriteArtists.push(name);
  persist();
}

export function removeFavoriteArtist(artistName) {
  profile.value.favoriteArtists = profile.value.favoriteArtists.filter(a => a !== artistName);
  persist();
}
