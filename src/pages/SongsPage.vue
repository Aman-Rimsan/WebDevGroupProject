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
          <label class="label">
            <!-- SVG: search icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right:4px;vertical-align:middle;" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search
          </label>
          <div class="control">
            <input v-model="searchQuery" class="input" type="text" placeholder='Try a fuzzy search, like "sabrna" or "kpop"' />
          </div>
        </div>
        <div class="field">
          <label class="label">
            <!-- SVG: person icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right:4px;vertical-align:middle;" aria-hidden="true">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            Artist filter
          </label>
          <div class="control">
            <input v-model="filterArtist" class="input" type="text" placeholder="Filter by artist" />
          </div>
        </div>
        <div class="field">
          <label class="label">
            <!-- SVG: filter/tag icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right:4px;vertical-align:middle;" aria-hidden="true">
              <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v2.99C3 10.55 3.22 11.08 3.61 11.46l5.39 5.4v5.14c0 .41.47.65.8.4l2.99-2.24c.2-.15.31-.38.31-.63v-3.01l4.98-5.27C18.16 10.69 18.27 9.34 17.63 5.84z"/>
            </svg>
            Genre filter
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
              <button class="button is-small is-danger is-light icon-btn" @click="removeSong(song.id)" title="Remove song">
                <!-- SVG: trash icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
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
        <div class="section-title">
          <!-- SVG: add/plus icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add a song
        </div>
        <div class="form-grid form-grid-compact">
          <input v-model="newSong.title" class="input" type="text" placeholder="Title" />
          <input v-model="newSong.artist" class="input" type="text" placeholder="Artist" />
          <input v-model="newSong.genre" class="input" type="text" placeholder="Genre" />
          <input v-model="newSong.duration" class="input" type="text" placeholder="Duration" />
          <input v-model="newSong.year" class="input" type="text" placeholder="Year" />
          <input v-model="newSong.album" class="input" type="text" placeholder="Album (optional)" />
        </div>
        <div class="inline-actions mt-4">
          <button class="button is-success" @click="addSongToLibrary">Add song</button>
          <p class="helper-text">The song is written back to the CSV file through the API.</p>
        </div>
      </section>

      <section class="box">
        <div class="section-title">
          <!-- SVG: remove/minus icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Remove by ID
        </div>
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

    <!-- D3 Charts -->
    <div class="grid-two">
      <section class="box">
        <div class="section-title">
          <!-- SVG: bar chart icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>
          </svg>
          Songs by Genre
        </div>
        <div ref="genreChartEl" class="d3-chart-container"></div>
      </section>

      <section class="box">
        <div class="section-title">
          <!-- SVG: calendar/year icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
          </svg>
          Songs by Year
        </div>
        <div ref="yearChartEl" class="d3-chart-container"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Fuse from 'fuse.js';
import * as d3 from 'd3';
import $ from 'jquery';
import { addSong, deleteSong, fetchSongs } from '../api';

const songs = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const filterArtist = ref('');
const filterGenre = ref('');
const removeId = ref('');
const newSong = reactive({ title: '', artist: '', genre: '', duration: '', year: '', album: '' });

const genreChartEl = ref(null);
const yearChartEl = ref(null);

const uniqueGenres = computed(() =>
  [...new Set(songs.value.map((s) => s.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b))
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
  if (query) results = fuse.value.search(query).map((r) => r.item);
  if (filterArtist.value.trim()) {
    const needle = filterArtist.value.trim().toLowerCase();
    results = results.filter((s) => String(s.artist ?? '').toLowerCase().includes(needle));
  }
  if (filterGenre.value) results = results.filter((s) => s.genre === filterGenre.value);
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

// ── D3: Songs by Genre bar chart ──────────────────────────────────────────────
function drawGenreChart(data) {
  const el = genreChartEl.value;
  if (!el) return;
  d3.select(el).selectAll('*').remove();

  const counts = d3.rollups(data, (v) => v.length, (d) => d.genre)
    .filter(([g]) => g)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const containerWidth = el.clientWidth || 400;
  const margin = { top: 16, right: 16, bottom: 80, left: 48 };
  const width = containerWidth - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';
  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6b7280';

  const x = d3.scaleBand().domain(counts.map(([g]) => g)).range([0, width]).padding(0.25);
  const y = d3.scaleLinear().domain([0, d3.max(counts, ([, v]) => v)]).nice().range([height, 0]);

  // Grid lines
  svg.append('g')
    .attr('class', 'd3-grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('line').attr('stroke', mutedColor).attr('stroke-opacity', 0.2));

  // Bars with entrance animation
  svg.selectAll('.bar')
    .data(counts)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', ([g]) => x(g))
    .attr('width', x.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('rx', 6)
    .attr('fill', accent)
    .attr('fill-opacity', 0.85)
    .transition().duration(600).ease(d3.easeCubicOut)
    .attr('y', ([, v]) => y(v))
    .attr('height', ([, v]) => height - y(v));

  // Value labels
  svg.selectAll('.bar-label')
    .data(counts)
    .join('text')
    .attr('class', 'bar-label')
    .attr('x', ([g]) => x(g) + x.bandwidth() / 2)
    .attr('y', ([, v]) => y(v) - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', textColor)
    .attr('opacity', 0)
    .text(([, v]) => v)
    .transition().delay(400).duration(300)
    .attr('opacity', 1);

  // X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px')
    .attr('transform', 'rotate(-30)')
    .style('text-anchor', 'end');

  // Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px');
}

// ── D3: Songs by Year bar chart ───────────────────────────────────────────────
function drawYearChart(data) {
  const el = yearChartEl.value;
  if (!el) return;
  d3.select(el).selectAll('*').remove();

  const counts = d3.rollups(data, (v) => v.length, (d) => d.year)
    .filter(([y]) => y && !isNaN(Number(y)))
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  if (!counts.length) return;

  const containerWidth = el.clientWidth || 400;
  const margin = { top: 16, right: 16, bottom: 50, left: 48 };
  const width = containerWidth - margin.left - margin.right;
  const height = 260 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';
  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6b7280';

  const x = d3.scaleBand().domain(counts.map(([y]) => y)).range([0, width]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(counts, ([, v]) => v)]).nice().range([height, 0]);

  svg.append('g')
    .attr('class', 'd3-grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('line').attr('stroke', mutedColor).attr('stroke-opacity', 0.2));

  svg.selectAll('.bar')
    .data(counts)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', ([yr]) => x(yr))
    .attr('width', x.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('rx', 5)
    .attr('fill', accent)
    .attr('fill-opacity', 0.7)
    .transition().duration(600).ease(d3.easeCubicOut)
    .attr('y', ([, v]) => y(v))
    .attr('height', ([, v]) => height - y(v));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px')
    .attr('transform', 'rotate(-25)')
    .style('text-anchor', 'end');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px');
}

// ── Song CRUD ─────────────────────────────────────────────────────────────────
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
    // jQuery: flash the new row green briefly
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
    songs.value = songs.value.filter((s) => String(s.id) !== id);
    if (String(removeId.value).trim() === id) removeId.value = '';
  } catch (err) {
    console.error('Failed to remove song:', err);
  }
}

// Redraw charts whenever songs change
watch(songs, (val) => {
  if (val.length) {
    // Use $nextTick equivalent — wait one tick so the DOM refs are ready
    setTimeout(() => {
      drawGenreChart(val);
      drawYearChart(val);
    }, 50);
  }
}, { deep: false });

onMounted(() => {
  loadSongs();
});
</script>
