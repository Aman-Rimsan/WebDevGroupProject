<template>
  <div class="section-stack">
    <section class="page-hero">
      <div>
        <p class="page-kicker">Songs</p>
        <h1 class="page-title">Smart song search</h1>
        <p class="page-subtitle">
          Search the catalog with fuzzy matching powered by Fuse.js, then narrow results by artist or genre.
        </p>
      </div>
      <div class="soft-pill">
        <span>Results</span>
        <strong>{{ visibleSongs.length }} / {{ songs.length }}</strong>
      </div>
    </section>

    <section class="box">
      <div class="song-toolbar">
        <div class="field">
          <label class="label">Search</label>
          <div class="control">
            <input v-model="searchQuery" class="input" type="text" placeholder='Try a fuzzy search, like "sabrna" or "kpop"' />
          </div>
        </div>
        <div class="field">
          <label class="label">Artist filter</label>
          <div class="control">
            <input v-model="filterArtist" class="input" type="text" placeholder="Filter by artist" />
          </div>
        </div>
        <div class="field">
          <label class="label">Genre filter</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="filterGenre">
                <option value="">All genres</option>
                <option v-for="genre in uniqueGenres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="song-summary mt-4">
        <div class="helper-text">
          Fuse.js ranks close matches automatically. Empty search fields show the full catalog.
        </div>
        <div class="genre-badges">
          <span class="genre-badge" v-for="item in genreBreakdown" :key="item.genre">
            {{ item.genre }} · {{ item.count }}
          </span>
        </div>
      </div>

      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Genre</th>
            <th>Duration</th>
            <th>Year</th>
            <th>Album</th>
            <th class="has-text-right">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in visibleSongs" :key="song.id">
            <td>{{ song.id }}</td>
            <td>{{ song.title }}</td>
            <td>{{ song.artist }}</td>
            <td>{{ song.genre }}</td>
            <td>{{ song.duration }}</td>
            <td>{{ song.year }}</td>
            <td>{{ song.album }}</td>
            <td class="has-text-right">
              <button class="button is-small is-danger is-light" @click="removeSong(song.id)">✕</button>
            </td>
          </tr>
          <tr v-if="!loading && visibleSongs.length === 0">
            <td colspan="8">
              <div class="empty-state">No songs matched your search.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="loading" class="helper-text">Loading catalog...</div>
      <div v-else-if="error" class="helper-text has-text-danger">{{ error }}</div>
    </section>

    <div class="grid-two">
      <section class="box">
        <div class="section-title">Add a song</div>
        <div class="form-grid form-grid-compact">
          <input v-model="newSong.title" class="input" type="text" placeholder="Title" />
          <input v-model="newSong.artist" class="input" type="text" placeholder="Artist" />
          <input v-model="newSong.genre" class="input" type="text" placeholder="Genre" />
          <input v-model="newSong.duration" class="input" type="text" placeholder="Duration" />
          <input v-model="newSong.year" class="input" type="text" placeholder="Year" />
          <input v-model="newSong.album" class="input" type="text" placeholder="Album (optional)" />
        </div>
        <div class="inline-actions mt-4">
          <button class="button is-success" @click="addSong">Add song</button>
          <p class="helper-text">The song is written back to the CSV file through the API.</p>
        </div>
      </section>

      <section class="box">
        <div class="section-title">Remove by ID</div>
        <div class="input-row">
          <div class="field">
            <input v-model="removeId" class="input" type="text" placeholder="Enter song ID" />
          </div>
          <div class="control">
            <button class="button is-danger" @click="removeSong(removeId)">Remove</button>
          </div>
        </div>

        <div class="mt-4">
          <p class="helper-text">Quick genre snapshot</p>
          <div class="genre-badges mt-3">
            <span class="genre-badge" v-for="genre in uniqueGenres.slice(0, 8)" :key="genre">{{ genre }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Fuse from 'fuse.js';
import { addSong, deleteSong, fetchSongs } from '../api';

const songs = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const filterArtist = ref('');
const filterGenre = ref('');
const removeId = ref('');
const newSong = reactive({
  title: '',
  artist: '',
  genre: '',
  duration: '',
  year: '',
  album: '',
});

const uniqueGenres = computed(() => [...new Set(songs.value.map((song) => song.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b)));

const fuse = computed(() => new Fuse(songs.value, {
  keys: ['title', 'artist', 'genre', 'album'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const visibleSongs = computed(() => {
  const query = searchQuery.value.trim();
  let results = songs.value;

  if (query) {
    results = fuse.value.search(query).map((result) => result.item);
  }

  if (filterArtist.value.trim()) {
    const needle = filterArtist.value.trim().toLowerCase();
    results = results.filter((song) => String(song.artist ?? '').toLowerCase().includes(needle));
  }

  if (filterGenre.value) {
    results = results.filter((song) => song.genre === filterGenre.value);
  }

  return results;
});

const genreBreakdown = computed(() => {
  const counts = new Map();
  for (const song of songs.value) {
    counts.set(song.genre, (counts.get(song.genre) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([genre]) => genre)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));
});

async function loadSongs() {
  loading.value = true;
  error.value = '';
  try {
    songs.value = await fetchSongs();
  } catch (err) {
    console.error('Failed to fetch songs:', err);
    error.value = 'Could not load the song catalog.';
  } finally {
    loading.value = false;
  }
}

async function addSongToLibrary() {
  try {
    const created = await addSong({ ...newSong });
    songs.value.push(created);
    newSong.title = '';
    newSong.artist = '';
    newSong.genre = '';
    newSong.duration = '';
    newSong.year = '';
    newSong.album = '';
  } catch (err) {
    console.error('Failed to add song:', err);
  }
}

async function removeSong(songId) {
  const id = String(songId ?? '').trim();
  if (!id) return;

  try {
    await deleteSong(id);
    songs.value = songs.value.filter((song) => String(song.id) !== id);
    if (String(removeId.value).trim() === id) {
      removeId.value = '';
    }
  } catch (err) {
    console.error('Failed to remove song:', err);
  }
}

async function removeById() {
  const id = removeId.value.trim();
  if (!id) return;
  await removeSong(id);
}

onMounted(() => {
  loadSongs();
});
</script>
