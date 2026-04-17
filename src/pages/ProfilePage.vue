<template>
  <div class="section-stack">
    <section class="page-hero">
      <div>
        <p class="page-kicker">Profile</p>
        <h1 class="page-title">Your music home</h1>
        <p class="page-subtitle">
          Keep track of favorite songs, artists, and playlists in one place.
        </p>
      </div>
      <router-link class="button is-light" to="/settings">
        <!-- SVG: gear icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
        </svg>
        Open settings
      </router-link>
    </section>

    <section class="box">
      <div class="profile-cover">
        <div class="profile-avatar">{{ initials }}</div>
        <div>
          <h2 class="profile-name">{{ displayName }}</h2>
          <p class="profile-bio">{{ bio }}</p>
        </div>
      </div>

      <div class="stat-grid mt-5">
        <!-- SVG icons on each stat card -->
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" class="stat-icon" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          <span class="stat-value">{{ stats.artists }}</span>
          <span class="stat-label">Artists favorited</span>
        </div>
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" class="stat-icon" aria-hidden="true">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          <span class="stat-value">{{ stats.songs }}</span>
          <span class="stat-label">Songs favorited</span>
        </div>
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" class="stat-icon" aria-hidden="true">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
          </svg>
          <span class="stat-value">{{ stats.playlists }}</span>
          <span class="stat-label">Playlists</span>
        </div>
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" class="stat-icon" aria-hidden="true">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <span class="stat-value">0</span>
          <span class="stat-label">Followers</span>
        </div>
      </div>
    </section>

    <!-- D3 Charts for Profile -->
    <div class="grid-two" v-if="stats.songs > 0 || stats.artists > 0">
      <section class="box">
        <div class="section-title">
          <!-- SVG: pie chart icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
          </svg>
          Favorite Genres (from songs)
        </div>
        <div ref="donutChartEl" class="d3-chart-container d3-donut-container"></div>
      </section>

      <section class="box">
        <div class="section-title">
          <!-- SVG: bar chart icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;vertical-align:middle;" aria-hidden="true">
            <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>
          </svg>
          Favorite Artists
        </div>
        <div ref="artistChartEl" class="d3-chart-container"></div>
        <p v-if="profile.favoriteArtists.length === 0" class="helper-text mt-2">Add some favorite artists to see your chart.</p>
      </section>
    </div>

    <div class="grid-two">
      <section class="section-stack">
        <div class="box">
          <div class="section-title">
            <!-- SVG: person icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            Favorite artists
          </div>
          <div class="input-row">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="artistSelect">
                    <option value="">Choose from the catalog...</option>
                    <option v-for="artist in uniqueArtists" :key="artist" :value="artist">{{ artist }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <input v-model="artistInput" class="input" type="text" placeholder="Or type an artist" />
              </div>
            </div>
            <div class="control">
              <button class="button is-success" @click="addArtist">Add</button>
            </div>
          </div>

          <table class="table is-fullwidth mt-4">
            <thead>
              <tr><th>Artist</th><th class="has-text-right">Remove</th></tr>
            </thead>
            <tbody>
              <tr v-for="(artist, index) in profile.favoriteArtists" :key="artist + index">
                <td>{{ artist }}</td>
                <td class="has-text-right">
                  <button class="button is-small is-danger is-light icon-btn" @click="removeArtist(index)" title="Remove artist">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="profile.favoriteArtists.length === 0">
                <td colspan="2" class="has-text-centered has-text-grey">No favorite artists yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="box">
          <div class="section-title">
            <!-- SVG: music note icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
            </svg>
            Favorite songs
          </div>

          <div class="field mb-4">
            <label class="label">Choose a song from the catalog</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="songSelect">
                  <option value="">Select a song...</option>
                  <option v-for="song in songOptions" :key="song.value" :value="song.value">{{ song.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="section-title mb-3" style="font-size:0.98rem;">Or add a custom song</div>
            <div class="form-grid">
              <input v-model="customTitle" class="input" type="text" placeholder="Song title" />
              <input v-model="customArtist" class="input" type="text" placeholder="Artist" />
            </div>
          </div>

          <div class="mt-4 inline-actions">
            <button class="button is-success" @click="addFavoriteSong">Add song</button>
            <p class="helper-text">Duplicates are ignored automatically.</p>
          </div>

          <table class="table is-fullwidth mt-4">
            <thead>
              <tr><th>Title</th><th>Artist</th><th class="has-text-right">Remove</th></tr>
            </thead>
            <tbody>
              <tr v-for="(song, index) in favoriteSongRows" :key="song.label + index">
                <td>{{ song.title }}</td>
                <td>{{ song.artist }}</td>
                <td class="has-text-right">
                  <button class="button is-small is-danger is-light icon-btn" @click="removeSong(index)" title="Remove song">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="favoriteSongRows.length === 0">
                <td colspan="3" class="has-text-centered has-text-grey">No favorite songs yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="section-stack">
        <div class="box">
          <div class="section-title">
            <!-- SVG: playlist icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            Playlists
          </div>
          <div class="input-row">
            <div class="field">
              <input v-model="playlistInput" class="input" type="text" placeholder="Create a playlist name" />
            </div>
            <div class="control">
              <button class="button is-success" @click="addPlaylist">Add</button>
            </div>
          </div>

          <div class="mt-4">
            <div v-for="(playlist, index) in profile.playlists" :key="playlist + index" class="panel-card">
              <div class="is-flex is-justify-content-space-between is-align-items-center">
                <span>{{ playlist }}</span>
                <button class="button is-small is-danger is-light icon-btn" @click="removePlaylist(index)" title="Remove playlist">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="profile.playlists.length === 0" class="helper-text">No playlists yet.</p>
          </div>
        </div>

        <div class="box">
          <div class="section-title">
            <!-- SVG: library icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            Song catalog
          </div>
          <div v-if="loading" class="helper-text">Loading songs...</div>
          <div v-else-if="loadError" class="helper-text has-text-danger">{{ loadError }}</div>
          <div v-else>
            <p class="helper-text mb-3">{{ songOptions.length }} songs available for quick selection.</p>
            <div class="genre-badges">
              <span class="genre-badge" v-for="artist in uniqueArtists.slice(0, 8)" :key="artist">{{ artist }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import * as d3 from 'd3';
import $ from 'jquery';
import { fetchSongs, loadJSON, postJSON, saveJSON } from '../api';

const STORAGE_KEYS = { profile: 'spotifyClone.profile', settings: 'spotifyClone.settings' };
const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
};

const profile = reactive(loadJSON(STORAGE_KEYS.profile, { playlists: [], favoriteSongs: [], favoriteArtists: [] }));
const settings = reactive(loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS));

const songs = ref([]);
const loading = ref(true);
const loadError = ref('');

const playlistInput = ref('');
const artistSelect = ref('');
const artistInput = ref('');
const songSelect = ref('');
const customTitle = ref('');
const customArtist = ref('');

const donutChartEl = ref(null);
const artistChartEl = ref(null);

const displayName = computed(() => settings.displayName?.trim() || 'Guest');
const bio = computed(() => settings.profileDescription?.trim() || DEFAULT_SETTINGS.profileDescription);
const uniqueArtists = computed(() =>
  [...new Set(songs.value.map((s) => s.artist).filter(Boolean))].sort((a, b) => a.localeCompare(b))
);
const songOptions = computed(() => songs.value.map((s) => ({ label: `${s.title} - ${s.artist}`, value: `${s.title} - ${s.artist}` })));
const stats = computed(() => ({ artists: profile.favoriteArtists.length, songs: profile.favoriteSongs.length, playlists: profile.playlists.length }));
const favoriteSongRows = computed(() =>
  profile.favoriteSongs.map((entry) => {
    const idx = entry.indexOf(' - ');
    if (idx === -1) return { title: entry, artist: '', label: entry };
    return { title: entry.slice(0, idx), artist: entry.slice(idx + 3), label: entry };
  })
);
const initials = computed(() =>
  String(displayName.value || 'G').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'G'
);

// ── D3: Donut chart of genres from favorite songs ─────────────────────────────
function drawDonutChart() {
  const el = donutChartEl.value;
  if (!el) return;
  d3.select(el).selectAll('*').remove();

  // Derive genres from favoriteSongs by matching against catalog
  const songMap = new Map(songs.value.map((s) => [`${s.title} - ${s.artist}`, s.genre]));
  const genreCounts = new Map();
  for (const entry of profile.favoriteSongs) {
    const genre = songMap.get(entry) || 'Unknown';
    genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
  }

  if (genreCounts.size === 0) {
    d3.select(el).append('p').attr('class', 'helper-text').text('Add favorite songs to see your genre breakdown.');
    return;
  }

  const data = [...genreCounts.entries()].map(([genre, count]) => ({ genre, count }));
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6b7280';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';

  const containerWidth = el.clientWidth || 320;
  const size = Math.min(containerWidth, 280);
  const radius = size / 2 - 20;

  // Color palette derived from accent
  const colorScale = d3.scaleOrdinal()
    .domain(data.map((d) => d.genre))
    .range(d3.quantize((t) => d3.interpolateRgb('#1db954', '#0284c7')(t), Math.max(data.length, 2)));

  const svg = d3.select(el)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', size)
    .append('g')
    .attr('transform', `translate(${size / 2},${size / 2})`);

  const pie = d3.pie().value((d) => d.count).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 8);

  const slices = svg.selectAll('.slice')
    .data(pie(data))
    .join('g')
    .attr('class', 'slice');

  slices.append('path')
    .attr('fill', (d) => colorScale(d.data.genre))
    .attr('stroke', 'var(--surface)')
    .attr('stroke-width', 2)
    .attr('d', arc)
    .attr('opacity', 0)
    .transition().duration(600).ease(d3.easeCubicOut)
    .attr('opacity', 0.9)
    .attrTween('d', function (d) {
      const interp = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return (t) => arc(interp(t));
    });

  // Hover via jQuery for DOM manipulation
  slices.selectAll('path')
    .on('mouseenter', function (event, d) {
      d3.select(this).transition().duration(150).attr('d', arcHover).attr('opacity', 1);
      $(this).closest('svg').find('.donut-center-label').text(d.data.genre);
      $(this).closest('svg').find('.donut-center-count').text(d.data.count);
    })
    .on('mouseleave', function () {
      d3.select(this).transition().duration(150).attr('d', arc).attr('opacity', 0.9);
      $(this).closest('svg').find('.donut-center-label').text('');
      $(this).closest('svg').find('.donut-center-count').text('');
    });

  // Center label
  svg.append('text').attr('class', 'donut-center-count').attr('text-anchor', 'middle').attr('dy', '-0.1em')
    .attr('font-size', '22px').attr('font-weight', '700').attr('fill', textColor).text('');
  svg.append('text').attr('class', 'donut-center-label').attr('text-anchor', 'middle').attr('dy', '1.2em')
    .attr('font-size', '11px').attr('fill', mutedColor).text('hover a slice');

  // Legend (to the right)
  const legendX = size + 8;
  const legend = d3.select(el).select('svg').append('g').attr('transform', `translate(${legendX}, 20)`);
  data.slice(0, 8).forEach((d, i) => {
    legend.append('rect').attr('x', 0).attr('y', i * 22).attr('width', 12).attr('height', 12).attr('rx', 3).attr('fill', colorScale(d.genre));
    legend.append('text').attr('x', 18).attr('y', i * 22 + 10).attr('font-size', '11px').attr('fill', mutedColor).text(`${d.genre} (${d.count})`);
  });
}

// ── D3: Artist bar chart (favorite artists) ────────────────────────────────────
function drawArtistChart() {
  const el = artistChartEl.value;
  if (!el) return;
  d3.select(el).selectAll('*').remove();

  if (profile.favoriteArtists.length === 0) return;

  // Count songs per favorite artist in the catalog
  const artistSongCounts = profile.favoriteArtists.map((artist) => ({
    artist,
    count: songs.value.filter((s) => s.artist === artist).length,
  })).sort((a, b) => b.count - a.count);

  const containerWidth = el.clientWidth || 400;
  const margin = { top: 16, right: 16, bottom: 80, left: 48 };
  const width = containerWidth - margin.left - margin.right;
  const height = 240 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';
  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6b7280';

  const x = d3.scaleBand().domain(artistSongCounts.map((d) => d.artist)).range([0, width]).padding(0.3);
  const y = d3.scaleLinear().domain([0, d3.max(artistSongCounts, (d) => d.count) || 1]).nice().range([height, 0]);

  svg.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(''))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('line').attr('stroke', mutedColor).attr('stroke-opacity', 0.2));

  svg.selectAll('.bar')
    .data(artistSongCounts)
    .join('rect')
    .attr('x', (d) => x(d.artist))
    .attr('width', x.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('rx', 5)
    .attr('fill', accent)
    .attr('fill-opacity', 0.8)
    .transition().duration(600).ease(d3.easeCubicOut)
    .attr('y', (d) => y(d.count))
    .attr('height', (d) => height - y(d.count));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px')
    .attr('transform', 'rotate(-30)')
    .style('text-anchor', 'end');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedColor)
    .attr('font-size', '11px');
}

function redrawCharts() {
  setTimeout(() => {
    drawDonutChart();
    drawArtistChart();
  }, 50);
}

function persistProfile() {
  const payload = {
    playlists: [...profile.playlists],
    favoriteSongs: [...profile.favoriteSongs],
    favoriteArtists: [...profile.favoriteArtists],
  };
  saveJSON(STORAGE_KEYS.profile, payload);
  postJSON('/api/profile', payload).catch(() => {});
}

function addPlaylist() {
  const value = playlistInput.value.trim();
  if (!value || profile.playlists.includes(value)) return;
  profile.playlists.push(value);
  persistProfile();
  playlistInput.value = '';
}
function removePlaylist(index) { profile.playlists.splice(index, 1); persistProfile(); }

function addFavoriteSong() {
  const dropdownValue = songSelect.value.trim();
  const manualTitle = customTitle.value.trim();
  const manualArtist = customArtist.value.trim();
  const label = dropdownValue || (manualTitle && manualArtist ? `${manualTitle} - ${manualArtist}` : '');
  if (!label || profile.favoriteSongs.includes(label)) return;
  profile.favoriteSongs.push(label);
  persistProfile();
  songSelect.value = '';
  customTitle.value = '';
  customArtist.value = '';
  redrawCharts();
}
function removeSong(index) { profile.favoriteSongs.splice(index, 1); persistProfile(); redrawCharts(); }

function addArtist() {
  const value = (artistSelect.value || artistInput.value).trim();
  if (!value || profile.favoriteArtists.includes(value)) return;
  profile.favoriteArtists.push(value);
  persistProfile();
  artistSelect.value = '';
  artistInput.value = '';
  redrawCharts();
}
function removeArtist(index) { profile.favoriteArtists.splice(index, 1); persistProfile(); redrawCharts(); }

onMounted(async () => {
  loading.value = true;
  loadError.value = '';
  try {
    songs.value = await fetchSongs();
    redrawCharts();
  } catch (err) {
    console.error('Failed to load songs from server', err);
    loadError.value = 'Could not load the song catalog.';
  } finally {
    loading.value = false;
  }

  // jQuery: animate stat cards in on load
  $('.stat-card').css({ opacity: 0, transform: 'translateY(12px)' });
  $('.stat-card').each(function (i) {
    $(this).delay(i * 80).animate({ opacity: 1 }, 400);
  });
});
</script>
