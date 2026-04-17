<template>
  <div class="section-stack">

    <PageHero kicker="Songs" title="Smart song search" subtitle="Search the catalog with fuzzy matching powered by Fuse.js, then narrow results by artist or genre.">
      <div class="tags has-addons" style="margin:0">
        <span class="tag is-light" style="background:var(--surface);border:1px solid var(--border);color:var(--muted);">Results</span>
        <span class="tag" style="background:var(--accent);color:#fff;">{{ visibleSongs.length }} / {{ songs.length }}</span>
      </div>
    </PageHero>

    <!-- Search & filter toolbar -->
    <div class="box">
      <div class="columns is-variable is-3">
        <div class="column">
          <div class="field">
            <label class="label">
              <SvgIcon name="search" :size="13" class="mr-1" />Search
            </label>
            <div class="control">
              <input v-model="searchQuery" class="input" type="text" placeholder='Try "sabrna" or "kpop"' />
            </div>
          </div>
        </div>
        <div class="column is-narrow" style="min-width:200px">
          <div class="field">
            <label class="label">
              <SvgIcon name="person" :size="13" class="mr-1" />Artist
            </label>
            <div class="control">
              <input v-model="filterArtist" class="input" type="text" placeholder="Filter by artist" />
            </div>
          </div>
        </div>
        <div class="column is-narrow" style="min-width:200px">
          <div class="field">
            <label class="label">
              <SvgIcon name="filter" :size="13" class="mr-1" />Genre
            </label>
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
      </div>

      <!-- Genre breakdown badges -->
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-4 mt-2" style="flex-wrap:wrap;gap:0.75rem;">
        <p class="is-size-7" style="color:var(--muted);">Fuse.js ranks close matches. Empty fields show the full catalog.</p>
        <GenreBadges :items="genreBreakdown.map(g => ({ label: g.genre, count: g.count }))" />
      </div>

      <!-- Song table -->
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Artist</th><th>Genre</th>
              <th>Duration</th><th>Year</th><th>Album</th>
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
                <RemoveButton title="Remove song" @click="removeSong(song.id)" />
              </td>
            </tr>
            <tr v-if="!loading && visibleSongs.length === 0">
              <td colspan="8">
                <p class="has-text-centered py-5" style="color:var(--muted);">No songs matched your search.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="loading" class="is-size-7 mt-2" style="color:var(--muted);">Loading catalog…</p>
      <p v-else-if="error" class="has-text-danger is-size-7 mt-2">{{ error }}</p>
    </div>

    <!-- Add / Remove by ID -->
    <div class="columns is-variable is-4">
      <div class="column">
        <div class="box">
          <SectionTitle icon="plus">Add a song</SectionTitle>
          <div class="columns is-multiline is-variable is-2 mt-2">
            <div class="column is-4">
              <input v-model="newSong.title"    class="input" type="text" placeholder="Title" />
            </div>
            <div class="column is-4">
              <input v-model="newSong.artist"   class="input" type="text" placeholder="Artist" />
            </div>
            <div class="column is-4">
              <input v-model="newSong.genre"    class="input" type="text" placeholder="Genre" />
            </div>
            <div class="column is-4">
              <input v-model="newSong.duration" class="input" type="text" placeholder="Duration" />
            </div>
            <div class="column is-4">
              <input v-model="newSong.year"     class="input" type="text" placeholder="Year" />
            </div>
            <div class="column is-4">
              <input v-model="newSong.album"    class="input" type="text" placeholder="Album (optional)" />
            </div>
          </div>
          <div class="field is-grouped mt-3">
            <div class="control">
              <button class="button is-success" @click="addSongToLibrary">Add song</button>
            </div>
            <p class="is-size-7 is-align-self-center" style="color:var(--muted);">Written to CSV via the API.</p>
          </div>
        </div>
      </div>

      <div class="column is-narrow" style="min-width:260px">
        <div class="box">
          <SectionTitle icon="trash">Remove by ID</SectionTitle>
          <div class="field has-addons mt-3">
            <div class="control is-expanded">
              <input v-model="removeId" class="input" type="text" placeholder="Song ID" />
            </div>
            <div class="control">
              <button class="button is-danger" @click="removeSong(removeId)">Remove</button>
            </div>
          </div>
          <p class="is-size-7 mb-2 mt-4" style="color:var(--muted);">Quick genre snapshot</p>
          <GenreBadges :items="uniqueGenres.slice(0, 8)" />
        </div>
      </div>
    </div>

    <!-- D3 Charts -->
    <div class="columns is-variable is-4">
      <div class="column">
        <div class="box">
          <SectionTitle icon="bar-chart">Songs by Genre</SectionTitle>
          <D3BarChart :data="genreChartData" :label-rotation="-30" class="mt-3" />
        </div>
      </div>
      <div class="column">
        <div class="box">
          <SectionTitle icon="calendar">Songs by Year</SectionTitle>
          <D3BarChart :data="yearChartData" :label-rotation="-25" class="mt-3" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Fuse from 'fuse.js';
import $ from 'jquery';

import PageHero      from '../components/PageHero.vue';
import SectionTitle  from '../components/SectionTitle.vue';
import SvgIcon       from '../components/SvgIcon.vue';
import RemoveButton  from '../components/RemoveButton.vue';
import GenreBadges   from '../components/GenreBadges.vue';
import D3BarChart    from '../components/D3BarChart.vue';

import { addSong, deleteSong, fetchSongs } from '../api';

// ── State ─────────────────────────────────────────────────────────────────────
const songs       = ref([]);
const loading     = ref(true);
const error       = ref('');
const searchQuery = ref('');
const filterArtist = ref('');
const filterGenre  = ref('');
const removeId     = ref('');
const newSong = reactive({ title: '', artist: '', genre: '', duration: '', year: '', album: '' });

// ── Computed ──────────────────────────────────────────────────────────────────
const uniqueGenres = computed(() =>
  [...new Set(songs.value.map(s => s.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b))
);

const fuse = computed(() => new Fuse(songs.value, {
  keys: ['title', 'artist', 'genre', 'album'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const visibleSongs = computed(() => {
  const query = searchQuery.value.trim();
  let results = songs.value;
  if (query) results = fuse.value.search(query).map(r => r.item);
  if (filterArtist.value.trim()) {
    const needle = filterArtist.value.trim().toLowerCase();
    results = results.filter(s => String(s.artist ?? '').toLowerCase().includes(needle));
  }
  if (filterGenre.value) results = results.filter(s => s.genre === filterGenre.value);
  return results;
});

const genreBreakdown = computed(() => {
  const counts = new Map();
  for (const s of songs.value) counts.set(s.genre, (counts.get(s.genre) || 0) + 1);
  return [...counts.entries()]
    .filter(([g]) => g)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));
});

// Data shaped for D3BarChart: { label, value }[]
const genreChartData = computed(() =>
  genreBreakdown.value.map(g => ({ label: g.genre, value: g.count }))
);

const yearChartData = computed(() => {
  const counts = new Map();
  for (const s of songs.value) {
    if (s.year && !isNaN(Number(s.year))) counts.set(s.year, (counts.get(s.year) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([label, value]) => ({ label, value }));
});

// ── CRUD ──────────────────────────────────────────────────────────────────────
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
    // jQuery: briefly highlight the new row
    $('table tbody tr:last').css('background', 'rgba(29,185,84,0.18)').animate({ opacity: 1 }, 600, function () {
      $(this).css('background', '');
    });
    Object.assign(newSong, { title: '', artist: '', genre: '', duration: '', year: '', album: '' });
  } catch (err) {
    console.error('Failed to add song:', err);
  }
}

async function removeSong(songId) {
  const id = String(songId ?? '').trim();
  if (!id) return;
  try {
    await deleteSong(id);
    songs.value = songs.value.filter(s => String(s.id) !== id);
    if (String(removeId.value).trim() === id) removeId.value = '';
  } catch (err) {
    console.error('Failed to remove song:', err);
  }
}

onMounted(loadSongs);
</script>
