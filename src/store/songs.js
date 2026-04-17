import { computed, ref } from 'vue';
import { fetchSongs } from '../api';

// ── State ─────────────────────────────────────────────────────────────────────
export const songs        = ref([]);
export const songsLoading = ref(false);
export const songsError   = ref('');
let loadPromise = null; // de-dupe concurrent loads

// ── Derived helpers ───────────────────────────────────────────────────────────

/**
 * Map of song id -> song object. Memoized via computed.
 */
export const songsById = computed(() => {
  const m = new Map();
  for (const s of songs.value) m.set(s.id, s);
  return m;
});

/**
 * Map of artist name -> first song we've seen for that artist.
 * Used to infer an artist's "picture" from one of their album covers.
 */
export const artistFirstSong = computed(() => {
  const m = new Map();
  for (const s of songs.value) {
    if (!m.has(s.artist)) m.set(s.artist, s);
  }
  return m;
});

/** Sorted unique artist names (for search/filter). */
export const uniqueArtists = computed(() =>
  [...new Set(songs.value.map(s => s.artist))].sort((a, b) => a.localeCompare(b))
);

/** Sorted unique genres (for filter dropdowns). */
export const uniqueGenres = computed(() =>
  [...new Set(songs.value.map(s => s.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b))
);

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Load the song catalog. Safe to call multiple times — only fetches once.
 */
export async function loadSongs() {
  if (songs.value.length > 0) return songs.value;
  if (loadPromise) return loadPromise;

  songsLoading.value = true;
  songsError.value = '';

  loadPromise = fetchSongs()
    .then((data) => {
      songs.value = data;
      return data;
    })
    .catch((err) => {
      console.error('Failed to load songs:', err);
      songsError.value = 'Could not load the song catalog.';
      throw err;
    })
    .finally(() => {
      songsLoading.value = false;
      loadPromise = null;
    });

  return loadPromise;
}

/** Look up a song by id. */
export function getSong(id) {
  return songsById.value.get(id) ?? null;
}

/**
 * Get a Fisher-Yates-style random sample of N songs from the catalog.
 * Used as the empty-state "featured songs" list on the Songs page.
 */
export function getRandomSongs(n = 20) {
  const source = songs.value;
  if (source.length <= n) return [...source];
  const result = [];
  const seen = new Set();
  while (result.length < n) {
    const i = Math.floor(Math.random() * source.length);
    if (seen.has(i)) continue;
    seen.add(i);
    result.push(source[i]);
  }
  return result;
}
