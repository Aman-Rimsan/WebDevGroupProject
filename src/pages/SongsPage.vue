<template>
  <div class="section-stack">

    <PageHero
      kicker="Songs"
      title="Discover music"
      subtitle="10,338 songs available. Search by title, artist, or genre."
    />

    <!-- Search bar -->
    <div class="box">
      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="searchQuery"
            class="input"
            type="text"
            placeholder="Search for a song…"
          />
          <span class="icon is-left" style="color:var(--muted);">
            <SvgIcon name="search" :size="16" />
          </span>
        </div>
      </div>

      <p class="is-size-7 mt-2" style="color:var(--muted);">
        {{ searchQuery.trim() ? 'Showing top 20 matches.' : 'Start typing to search.' }}
      </p>
    </div>

    <!-- Results list -->
    <div class="box" style="padding: 0.5rem;">
      <div v-if="loading" class="has-text-centered py-5" style="color:var(--muted);">Loading catalog…</div>
      <div v-else-if="error" class="has-text-centered py-5 has-text-danger">{{ error }}</div>
      <div v-else-if="visibleSongs.length === 0" class="has-text-centered py-5" style="color:var(--muted);">No songs matched your search.</div>
      <SongRow
        v-for="song in visibleSongs"
        :key="song.id"
        :song="song"
        :is-liked="favoriteSongIds.has(song.id)"
        :show-remove="false"
        @toggle-like="song => toggleFavoriteSong(song.id)"
      />
    </div>

    <!-- Charts -->
    <div class="columns is-variable is-4 is-multiline">
      <div class="column">
        <div class="box">
          <SectionTitle icon="bar-chart">Top genres in catalog</SectionTitle>
          <D3BarChart :data="genreChartData" :label-rotation="-30" class="mt-3" />
        </div>
      </div>
      <div class="column">
        <div class="box">
          <SectionTitle icon="person">Top artists in catalog</SectionTitle>
          <D3BarChart :data="topArtistsData" :label-rotation="-30" class="mt-3" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Fuse from 'fuse.js';

import PageHero from '../components/PageHero.vue';
import SectionTitle from '../components/SectionTitle.vue';
import SvgIcon from '../components/SvgIcon.vue';
import SongRow from '../components/SongRow.vue';
import D3BarChart from '../components/D3BarChart.vue';

import { songs as songsCatalog, songsLoading, songsError, loadSongs, getRandomSongs } from '../store/songs.js';
import { favoriteSongIds, toggleFavoriteSong, loadProfile } from '../store/profile.js';

const searchQuery = ref('');
const randomSeed = ref([]);

const loading = computed(() => songsLoading.value && songsCatalog.value.length === 0);
const error = computed(() => songsError.value);

// Fuse.js search index for songs
const fuse = computed(() => new Fuse(songsCatalog.value, {
  keys: ['title', 'artist', 'genre'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const visibleSongs = computed(() => {
  const q = searchQuery.value.trim();
  return q ? fuse.value.search(q).slice(0, 20).map(r => r.item) : randomSeed.value;
});

// Count songs per genre/artist for the D3 charts.
function countBy(key) {
  const counts = new Map();
  for (const s of songsCatalog.value) counts.set(s[key], (counts.get(s[key]) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));
}

const genreChartData = computed(() => countBy('genre').filter(d => d.label));
const topArtistsData = computed(() => countBy('artist'));

onMounted(async () => {
  await loadSongs();
  loadProfile();
  randomSeed.value = getRandomSongs(20);
});
</script>
