<template>
  <div class="section-stack">

    <PageHero
      kicker="Songs"
      title="Search the catalog"
      :subtitle="`${songsCatalog.length.toLocaleString()} songs available. Search by title, artist, or genre — results ranked by relevance.`"
    >
      <div class="tags has-addons" style="margin:0">
        <span class="tag is-light" style="background:var(--surface);border:1px solid var(--border);color:var(--muted);">Showing</span>
        <span class="tag" style="background:var(--accent);color:#fff;">{{ visibleSongs.length }}</span>
      </div>
    </PageHero>

    <!-- Search bar -->
    <div class="box">
      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="searchQuery"
            class="input is-medium"
            type="text"
            placeholder="Start typing to search — try an artist, a song, or a genre…"
          />
          <span class="icon is-left" style="color:var(--muted);">
            <SvgIcon name="search" :size="16" />
          </span>
        </div>
      </div>

      <p class="is-size-7 mt-2" style="color:var(--muted);">
        {{ searchQuery.trim()
          ? `Showing top ${visibleSongs.length} matches. Refine your search for more specific results.`
          : `Showing 20 random picks from the catalog. Start typing to search.` }}
      </p>
    </div>

    <!-- Results list -->
    <div class="box" style="padding: 0.5rem;">
      <div v-if="loading" class="has-text-centered py-5" style="color:var(--muted);">
        Loading catalog…
      </div>
      <div v-else-if="error" class="has-text-centered py-5 has-text-danger">
        {{ error }}
      </div>
      <div v-else-if="visibleSongs.length === 0" class="has-text-centered py-5" style="color:var(--muted);">
        No songs matched your search.
      </div>
      <SongRow
        v-for="song in visibleSongs"
        :key="song.id"
        :song="song"
        :is-liked="favoriteSongIds.has(song.id)"
        :show-remove="false"
        @toggle-like="toggleLike"
      />
    </div>

    <!-- Charts -->
    <div class="columns is-variable is-4">
      <div class="column">
        <div class="box">
          <SectionTitle icon="bar-chart">Top Genres in Catalog</SectionTitle>
          <D3BarChart :data="genreChartData" :label-rotation="-30" class="mt-3" />
        </div>
      </div>
      <div class="column">
        <div class="box">
          <SectionTitle icon="person">Top Artists in Catalog</SectionTitle>
          <D3BarChart :data="topArtistsData" :label-rotation="-30" class="mt-3" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Fuse from 'fuse.js';

import PageHero     from '../components/PageHero.vue';
import SectionTitle from '../components/SectionTitle.vue';
import SvgIcon      from '../components/SvgIcon.vue';
import SongRow      from '../components/SongRow.vue';
import D3BarChart   from '../components/D3BarChart.vue';

import { songs as songsCatalog, songsLoading, songsError, loadSongs, getRandomSongs } from '../store/songs.js';
import { favoriteSongIds, toggleFavoriteSong, loadProfile } from '../store/profile.js';
import { loadPlaylists } from '../store/playlists.js';

const searchQuery = ref('');
const randomSeed  = ref([]);

const loading = computed(() => songsLoading.value && songsCatalog.value.length === 0);
const error   = computed(() => songsError.value);

// ── Fuse search ──────────────────────────────────────────────────────────────
const fuse = computed(() => new Fuse(songsCatalog.value, {
  keys: ['title', 'artist', 'genre'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const visibleSongs = computed(() => {
  const q = searchQuery.value.trim();
  if (!q) return randomSeed.value;
  return fuse.value.search(q).slice(0, 20).map(r => r.item);
});

// ── Chart data ───────────────────────────────────────────────────────────────
const genreChartData = computed(() => {
  const counts = new Map();
  for (const s of songsCatalog.value) {
    counts.set(s.genre, (counts.get(s.genre) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([g]) => g)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }));
});

const topArtistsData = computed(() => {
  const counts = new Map();
  for (const s of songsCatalog.value) {
    counts.set(s.artist, (counts.get(s.artist) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }));
});

// ── Actions ──────────────────────────────────────────────────────────────────
function toggleLike(song) {
  toggleFavoriteSong(song.id);
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadSongs();
  await loadPlaylists();
  loadProfile();
  randomSeed.value = getRandomSongs(20);
});
</script>
