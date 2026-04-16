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
      <router-link class="button is-light" to="/settings">Open settings</router-link>
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
        <div class="stat-card">
          <span class="stat-value">{{ stats.artists }}</span>
          <span class="stat-label">Artists favorited</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.songs }}</span>
          <span class="stat-label">Songs favorited</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.playlists }}</span>
          <span class="stat-label">Playlists</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">Followers</span>
        </div>
      </div>
    </section>

    <div class="grid-two">
      <section class="section-stack">
        <div class="box">
          <div class="section-title">Favorite artists</div>
          <div class="input-row">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="artistSelect">
                    <option value="">Choose from the catalog...</option>
                    <option v-for="artist in uniqueArtists" :key="artist" :value="artist">
                      {{ artist }}
                    </option>
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
              <tr>
                <th>Artist</th>
                <th class="has-text-right">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(artist, index) in profile.favoriteArtists" :key="artist + index">
                <td>{{ artist }}</td>
                <td class="has-text-right">
                  <button class="button is-small is-danger is-light" @click="removeArtist(index)">✕</button>
                </td>
              </tr>
              <tr v-if="profile.favoriteArtists.length === 0">
                <td colspan="2" class="has-text-centered has-text-grey">No favorite artists yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="box">
          <div class="section-title">Favorite songs</div>

          <div class="field mb-4">
            <label class="label">Choose a song from the catalog</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="songSelect">
                  <option value="">Select a song...</option>
                  <option v-for="song in songOptions" :key="song.value" :value="song.value">
                    {{ song.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="section-title mb-3" style="font-size: 0.98rem;">Or add a custom song</div>
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
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th class="has-text-right">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(song, index) in favoriteSongRows" :key="song.label + index">
                <td>{{ song.title }}</td>
                <td>{{ song.artist }}</td>
                <td class="has-text-right">
                  <button class="button is-small is-danger is-light" @click="removeSong(index)">✕</button>
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
          <div class="section-title">Playlists</div>
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
                <button class="button is-small is-danger is-light" @click="removePlaylist(index)">✕</button>
              </div>
            </div>

            <p v-if="profile.playlists.length === 0" class="helper-text">No playlists yet.</p>
          </div>
        </div>

        <div class="box">
          <div class="section-title">Song catalog</div>
          <div v-if="loading" class="helper-text">Loading songs...</div>
          <div v-else-if="loadError" class="helper-text has-text-danger">{{ loadError }}</div>
          <div v-else>
            <p class="helper-text mb-3">{{ songOptions.length }} songs available for quick selection.</p>
            <div class="genre-badges">
              <span class="genre-badge" v-for="artist in uniqueArtists.slice(0, 8)" :key="artist">
                {{ artist }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchSongs, loadJSON, postJSON, saveJSON } from '../api';

const STORAGE_KEYS = {
  profile: 'spotifyClone.profile',
  settings: 'spotifyClone.settings',
};

const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
};

const profile = reactive(loadJSON(STORAGE_KEYS.profile, {
  playlists: [],
  favoriteSongs: [],
  favoriteArtists: [],
}));

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

const displayName = computed(() => settings.displayName?.trim() || 'Guest');
const bio = computed(() => settings.profileDescription?.trim() || DEFAULT_SETTINGS.profileDescription);
const uniqueArtists = computed(() => [...new Set(songs.value.map((song) => song.artist).filter(Boolean))].sort((a, b) => a.localeCompare(b)));
const songOptions = computed(() => songs.value.map((song) => ({
  label: `${song.title} - ${song.artist}`,
  value: `${song.title} - ${song.artist}`,
})));
const stats = computed(() => ({
  artists: profile.favoriteArtists.length,
  songs: profile.favoriteSongs.length,
  playlists: profile.playlists.length,
}));
const favoriteSongRows = computed(() => profile.favoriteSongs.map((entry) => {
  const index = entry.indexOf(' - ');
  if (index === -1) return { title: entry, artist: '', label: entry };
  return { title: entry.slice(0, index), artist: entry.slice(index + 3), label: entry };
}));

const initials = computed(() => {
  return String(displayName.value || 'G')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'G';
});

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
  if (!value) return;

  if (!profile.playlists.includes(value)) {
    profile.playlists.push(value);
    persistProfile();
  }
  playlistInput.value = '';
}

function removePlaylist(index) {
  profile.playlists.splice(index, 1);
  persistProfile();
}

function addFavoriteSong() {
  const dropdownValue = songSelect.value.trim();
  const manualTitle = customTitle.value.trim();
  const manualArtist = customArtist.value.trim();

  const label = dropdownValue || (manualTitle && manualArtist ? `${manualTitle} - ${manualArtist}` : '');
  if (!label) return;

  if (!profile.favoriteSongs.includes(label)) {
    profile.favoriteSongs.push(label);
    persistProfile();
  }

  songSelect.value = '';
  customTitle.value = '';
  customArtist.value = '';
}

function removeSong(index) {
  profile.favoriteSongs.splice(index, 1);
  persistProfile();
}

function addArtist() {
  const value = (artistSelect.value || artistInput.value).trim();
  if (!value) return;

  if (!profile.favoriteArtists.includes(value)) {
    profile.favoriteArtists.push(value);
    persistProfile();
  }

  artistSelect.value = '';
  artistInput.value = '';
}

function removeArtist(index) {
  profile.favoriteArtists.splice(index, 1);
  persistProfile();
}

async function loadSongs() {
  loading.value = true;
  loadError.value = '';
  try {
    songs.value = await fetchSongs();
  } catch (error) {
    console.error('Failed to load songs from server', error);
    loadError.value = 'Could not load the song catalog.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSongs();
});
</script>
