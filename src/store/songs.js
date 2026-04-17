import { computed, ref } from 'vue';
import { fetchSongs } from '../api';

export const songs = ref([]);
export const songsLoading = ref(false);
export const songsError = ref('');

let loadPromise = null;

// Map of song id → song object, memoised via computed.
export const songsById = computed(() => {
  const m = new Map();
  for (const s of songs.value) m.set(s.id, s);
  return m;
});

// Map of artist name → their first song, used to infer artist artwork.
export const artistFirstSong = computed(() => {
  const m = new Map();
  for (const s of songs.value) {
    if (!m.has(s.artist)) m.set(s.artist, s);
  }
  return m;
});

export const uniqueArtists = computed(() =>
  [...new Set(songs.value.map(s => s.artist))].sort((a, b) => a.localeCompare(b))
);

// Fetch the catalog once; subsequent calls return the cached promise.
export async function loadSongs() {
  if (songs.value.length > 0) return songs.value;
  if (loadPromise) return loadPromise;

  songsLoading.value = true;
  songsError.value = '';

  loadPromise = fetchSongs()
    .then(data => {
      songs.value = data;
      return data;
    })
    .catch(err => {
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

// Return a random sample of n songs without repeats.
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
