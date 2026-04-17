<template>
  <div class="section-stack">

    <PageHero kicker="Profile" title="Your music home" subtitle="Keep track of favorite songs, artists, and playlists in one place.">
      <router-link class="button is-light" to="/settings">
        <SvgIcon name="settings" :size="14" class="mr-2" />Open settings
      </router-link>
    </PageHero>

    <!-- Profile card -->
    <div class="box">
      <div class="is-flex is-align-items-center" style="gap:1.25rem;flex-wrap:wrap;">
        <div class="profile-avatar">{{ initials }}</div>
        <div>
          <h2 class="profile-name">{{ displayName }}</h2>
          <p class="profile-bio">{{ bio }}</p>
        </div>
      </div>

      <div class="columns is-variable is-3 mt-5">
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="person"    :size="22" class="stat-icon" />
            <span class="stat-value">{{ stats.artists }}</span>
            <span class="stat-label">Artists favorited</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="music"     :size="22" class="stat-icon" />
            <span class="stat-value">{{ stats.songs }}</span>
            <span class="stat-label">Songs favorited</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="library"   :size="22" class="stat-icon" />
            <span class="stat-value">{{ stats.playlists }}</span>
            <span class="stat-label">Playlists</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="group"     :size="22" class="stat-icon" />
            <span class="stat-value">0</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite genres donut (only when there's data) -->
    <div class="box" v-if="stats.songs > 0">
      <SectionTitle icon="pie-chart">Favorite Genres</SectionTitle>
      <p class="is-size-7 mb-3 mt-1" style="color:var(--muted);">Derived from your favorited songs. Hover a slice to inspect.</p>
      <D3DonutChart :data="donutData" empty-message="Add favorite songs to see your genre breakdown." />
    </div>

    <!-- Main two-column area -->
    <div class="columns is-variable is-4">

      <!-- Left: artists + songs -->
      <div class="column">
        <div class="section-stack">

          <!-- Favorite artists -->
          <div class="box">
            <SectionTitle icon="person">Favorite artists</SectionTitle>
            <div class="field has-addons mt-3">
              <div class="control is-expanded">
                <div class="select is-fullwidth">
                  <select v-model="artistSelect">
                    <option value="">Choose from catalog…</option>
                    <option v-for="artist in uniqueArtists" :key="artist" :value="artist">{{ artist }}</option>
                  </select>
                </div>
              </div>
              <div class="control">
                <input v-model="artistInput" class="input" type="text" placeholder="Or type a name" style="border-left:none;" />
              </div>
              <div class="control">
                <button class="button is-success" @click="addArtist">Add</button>
              </div>
            </div>

            <table class="table is-fullwidth mt-3">
              <thead><tr><th>Artist</th><th class="has-text-right">Remove</th></tr></thead>
              <tbody>
                <tr v-for="(artist, index) in profile.favoriteArtists" :key="artist + index">
                  <td>{{ artist }}</td>
                  <td class="has-text-right">
                    <RemoveButton title="Remove artist" @click="removeArtist(index)" />
                  </td>
                </tr>
                <tr v-if="profile.favoriteArtists.length === 0">
                  <td colspan="2" class="has-text-centered has-text-grey">No favorite artists yet.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Favorite songs -->
          <div class="box">
            <SectionTitle icon="music">Favorite songs</SectionTitle>

            <div class="field mt-3">
              <label class="label is-small">Choose from catalog</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="songSelect">
                    <option value="">Select a song…</option>
                    <option v-for="song in songOptions" :key="song.value" :value="song.value">{{ song.label }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="notification" style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:1rem;">
              <p class="is-size-7 has-text-weight-semibold mb-2">Or add a custom song</p>
              <div class="columns is-variable is-2">
                <div class="column">
                  <input v-model="customTitle"  class="input" type="text" placeholder="Song title" />
                </div>
                <div class="column">
                  <input v-model="customArtist" class="input" type="text" placeholder="Artist" />
                </div>
              </div>
            </div>

            <div class="field is-grouped mt-3">
              <div class="control">
                <button class="button is-success" @click="addFavoriteSong">Add song</button>
              </div>
              <p class="is-size-7 is-align-self-center" style="color:var(--muted);">Duplicates are ignored.</p>
            </div>

            <table class="table is-fullwidth mt-3">
              <thead><tr><th>Title</th><th>Artist</th><th class="has-text-right">Remove</th></tr></thead>
              <tbody>
                <tr v-for="(song, index) in favoriteSongRows" :key="song.label + index">
                  <td>{{ song.title }}</td>
                  <td>{{ song.artist }}</td>
                  <td class="has-text-right">
                    <RemoveButton title="Remove song" @click="removeSong(index)" />
                  </td>
                </tr>
                <tr v-if="favoriteSongRows.length === 0">
                  <td colspan="3" class="has-text-centered has-text-grey">No favorite songs yet.</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <!-- Right: playlists + catalog info -->
      <div class="column is-4">
        <div class="section-stack">

          <div class="box">
            <SectionTitle icon="playlist">Playlists</SectionTitle>
            <div class="field has-addons mt-3">
              <div class="control is-expanded">
                <input v-model="playlistInput" class="input" type="text" placeholder="New playlist name" />
              </div>
              <div class="control">
                <button class="button is-success" @click="addPlaylist">Add</button>
              </div>
            </div>

            <div class="mt-3">
              <div v-for="(playlist, index) in profile.playlists" :key="playlist + index"
                   class="is-flex is-justify-content-space-between is-align-items-center py-2"
                   style="border-bottom:1px solid var(--border);">
                <span>{{ playlist }}</span>
                <RemoveButton title="Remove playlist" @click="removePlaylist(index)" />
              </div>
              <p v-if="profile.playlists.length === 0" class="is-size-7 mt-2" style="color:var(--muted);">No playlists yet.</p>
            </div>
          </div>

          <div class="box">
            <SectionTitle icon="library">Song catalog</SectionTitle>
            <div v-if="loading"      class="is-size-7 mt-2" style="color:var(--muted);">Loading songs…</div>
            <div v-else-if="loadError" class="has-text-danger is-size-7 mt-2">{{ loadError }}</div>
            <div v-else>
              <p class="is-size-7 mt-2 mb-3" style="color:var(--muted);">{{ songOptions.length }} songs available.</p>
              <GenreBadges :items="uniqueArtists.slice(0, 8)" />
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import $ from 'jquery';

import PageHero      from '../components/PageHero.vue';
import SectionTitle  from '../components/SectionTitle.vue';
import SvgIcon       from '../components/SvgIcon.vue';
import RemoveButton  from '../components/RemoveButton.vue';
import GenreBadges   from '../components/GenreBadges.vue';
import D3DonutChart  from '../components/D3DonutChart.vue';

import { fetchSongs, loadJSON, postJSON, saveJSON } from '../api';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEYS = { profile: 'spotifyClone.profile', settings: 'spotifyClone.settings' };
const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
};

// ── State ─────────────────────────────────────────────────────────────────────
const profile  = reactive(loadJSON(STORAGE_KEYS.profile, { playlists: [], favoriteSongs: [], favoriteArtists: [] }));
const settings = reactive(loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS));

const songs     = ref([]);
const loading   = ref(true);
const loadError = ref('');

const playlistInput = ref('');
const artistSelect  = ref('');
const artistInput   = ref('');
const songSelect    = ref('');
const customTitle   = ref('');
const customArtist  = ref('');

// ── Computed ──────────────────────────────────────────────────────────────────
const displayName = computed(() => settings.displayName?.trim() || 'Guest');
const bio         = computed(() => settings.profileDescription?.trim() || DEFAULT_SETTINGS.profileDescription);
const initials    = computed(() =>
  String(displayName.value || 'G').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'G'
);

const uniqueArtists = computed(() =>
  [...new Set(songs.value.map(s => s.artist).filter(Boolean))].sort((a, b) => a.localeCompare(b))
);
const songOptions = computed(() =>
  songs.value.map(s => ({ label: `${s.title} - ${s.artist}`, value: `${s.title} - ${s.artist}` }))
);
const stats = computed(() => ({
  artists:   profile.favoriteArtists.length,
  songs:     profile.favoriteSongs.length,
  playlists: profile.playlists.length,
}));
const favoriteSongRows = computed(() =>
  profile.favoriteSongs.map(entry => {
    const idx = entry.indexOf(' - ');
    if (idx === -1) return { title: entry, artist: '', label: entry };
    return { title: entry.slice(0, idx), artist: entry.slice(idx + 3), label: entry };
  })
);

// Donut chart data: derive genre from catalog for each favorited song
const donutData = computed(() => {
  const songMap = new Map(songs.value.map(s => [`${s.title} - ${s.artist}`, s.genre]));
  const counts  = new Map();
  for (const entry of profile.favoriteSongs) {
    const genre = songMap.get(entry) || 'Unknown';
    counts.set(genre, (counts.get(genre) || 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
});

// ── Persistence ───────────────────────────────────────────────────────────────
function persistProfile() {
  const payload = {
    playlists:        [...profile.playlists],
    favoriteSongs:    [...profile.favoriteSongs],
    favoriteArtists:  [...profile.favoriteArtists],
  };
  saveJSON(STORAGE_KEYS.profile, payload);
  postJSON('/api/profile', payload).catch(() => {});
}

// ── Actions ───────────────────────────────────────────────────────────────────
function addPlaylist() {
  const value = playlistInput.value.trim();
  if (!value || profile.playlists.includes(value)) return;
  profile.playlists.push(value);
  persistProfile();
  playlistInput.value = '';
}
function removePlaylist(index) { profile.playlists.splice(index, 1); persistProfile(); }

function addFavoriteSong() {
  const dropdown = songSelect.value.trim();
  const manual   = customTitle.value.trim() && customArtist.value.trim()
    ? `${customTitle.value.trim()} - ${customArtist.value.trim()}`
    : '';
  const label = dropdown || manual;
  if (!label || profile.favoriteSongs.includes(label)) return;
  profile.favoriteSongs.push(label);
  persistProfile();
  songSelect.value = '';
  customTitle.value = '';
  customArtist.value = '';
}
function removeSong(index) { profile.favoriteSongs.splice(index, 1); persistProfile(); }

function addArtist() {
  const value = (artistSelect.value || artistInput.value).trim();
  if (!value || profile.favoriteArtists.includes(value)) return;
  profile.favoriteArtists.push(value);
  persistProfile();
  artistSelect.value = '';
  artistInput.value  = '';
}
function removeArtist(index) { profile.favoriteArtists.splice(index, 1); persistProfile(); }

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value   = true;
  loadError.value = '';
  try {
    songs.value = await fetchSongs();
  } catch (err) {
    console.error('Failed to load songs from server', err);
    loadError.value = 'Could not load the song catalog.';
  } finally {
    loading.value = false;
  }

  // jQuery: staggered fade-in for stat cards
  $('.stat-card').css({ opacity: 0 });
  $('.stat-card').each(function (i) {
    $(this).delay(i * 80).animate({ opacity: 1 }, 400);
  });
});
</script>
