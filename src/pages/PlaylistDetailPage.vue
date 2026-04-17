<template>
  <div class="section-stack" v-if="playlist">

    <!-- Header -->
    <div class="page-hero">
      <div style="flex:1;min-width:0;">
        <p class="page-kicker">Playlist</p>

        <!-- Inline rename -->
        <div v-if="renaming" class="field has-addons mt-1 mb-0" style="max-width:480px;">
          <div class="control is-expanded">
            <input
              ref="renameInput"
              v-model="renameValue"
              class="input"
              style="font-size:1.6rem;font-weight:700;height:auto;padding:0.2rem 0.6rem;"
              @keyup.enter="confirmRename"
              @keyup.escape="cancelRename"
            />
          </div>
          <div class="control">
            <button class="button is-success" @click="confirmRename">
              <SvgIcon name="check" :size="16" />
            </button>
          </div>
        </div>
        <h1 v-else class="page-title" style="cursor:pointer;" @click="startRename" :title="'Click to rename'">
          {{ playlist.name }}
          <SvgIcon name="edit" :size="18" style="opacity:0.35;vertical-align:middle;margin-left:0.4rem;" />
        </h1>

        <p class="page-subtitle mt-1">
          {{ playlistSongs.length }} {{ playlistSongs.length === 1 ? 'song' : 'songs' }}
          <template v-if="playlistSongs.length > 0"> · {{ duration }}</template>
          · Created {{ formattedDate }}
        </p>
      </div>

      <div class="is-flex" style="gap:0.5rem;flex-shrink:0;">
        <router-link class="button is-light" to="/playlists">
          <SvgIcon name="queue" :size="14" class="mr-2" />All playlists
        </router-link>
        <button class="button is-danger is-light" @click="handleDelete">
          <SvgIcon name="trash" :size="14" class="mr-2" />Delete playlist
        </button>
      </div>
    </div>

    <!-- Song list -->
    <div class="box">
      <SectionTitle icon="music">Songs in this playlist</SectionTitle>

      <div class="table-container mt-3">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Artist</th><th>Genre</th>
              <th>Duration</th><th>Year</th><th>Album</th>
              <th class="has-text-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(song, idx) in playlistSongs" :key="song.id">
              <td style="color:var(--muted);width:2.5rem;">{{ idx + 1 }}</td>
              <td>{{ song.title }}</td>
              <td>{{ song.artist }}</td>
              <td>{{ song.genre }}</td>
              <td>{{ song.duration }}</td>
              <td>{{ song.year }}</td>
              <td>{{ song.album }}</td>
              <td class="has-text-right">
                <RemoveButton title="Remove from playlist" @click="handleRemoveSong(song.id)" />
              </td>
            </tr>
            <tr v-if="playlistSongs.length === 0">
              <td colspan="8">
                <p class="has-text-centered py-5" style="color:var(--muted);">
                  No songs yet. Add some below.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add songs from catalog -->
    <div class="box">
      <SectionTitle icon="plus">Add songs from catalog</SectionTitle>

      <!-- Search bar -->
      <div class="field mt-3">
        <div class="control">
          <input
            v-model="addSearch"
            class="input"
            type="text"
            placeholder="Search by title, artist, genre…"
          />
        </div>
      </div>

      <div class="table-container">
        <table class="table is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Title</th><th>Artist</th><th>Genre</th><th>Duration</th><th>Year</th>
              <th class="has-text-right">Add</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in searchResults" :key="song.id" :class="{ 'is-selected-row': isInPlaylist(song.id) }">
              <td>{{ song.title }}</td>
              <td>{{ song.artist }}</td>
              <td>{{ song.genre }}</td>
              <td>{{ song.duration }}</td>
              <td>{{ song.year }}</td>
              <td class="has-text-right">
                <button
                  class="button is-small is-success is-light icon-btn"
                  :disabled="isInPlaylist(song.id)"
                  :title="isInPlaylist(song.id) ? 'Already in playlist' : 'Add to playlist'"
                  @click="handleAddSong(song.id)"
                >
                  <SvgIcon :name="isInPlaylist(song.id) ? 'check' : 'plus'" :size="13" />
                </button>
              </td>
            </tr>
            <tr v-if="searchResults.length === 0">
              <td colspan="6">
                <p class="has-text-centered py-4" style="color:var(--muted);">No songs match your search.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="is-size-7 mt-2" style="color:var(--muted);">
        Showing {{ searchResults.length }} of {{ allSongs.length }} songs.
        Songs already in the playlist are marked with a check.
      </p>
    </div>

  </div>

  <!-- Not found -->
  <div v-else class="box has-text-centered py-6">
    <p class="has-text-weight-semibold">Playlist not found.</p>
    <router-link class="button is-light mt-4" to="/playlists">Back to playlists</router-link>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Fuse from 'fuse.js';

import SectionTitle from '../components/SectionTitle.vue';
import SvgIcon      from '../components/SvgIcon.vue';
import RemoveButton from '../components/RemoveButton.vue';

import {
  playlists,
  loadPlaylists,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylist,
} from '../store/playlists.js';
import { fetchSongs } from '../api.js';
import { totalDuration } from '../utils/duration.js';

const route  = useRoute();
const router = useRouter();

const allSongs   = ref([]);
const addSearch  = ref('');
const renaming   = ref(false);
const renameValue = ref('');
const renameInput = ref(null);

// Reactively look up this playlist from the shared store
const playlist = computed(() => getPlaylist(route.params.id));

const playlistSongs = computed(() => {
  if (!playlist.value) return [];
  return playlist.value.songIds
    .map(id => allSongs.value.find(s => String(s.id) === String(id)))
    .filter(Boolean);
});

const duration = computed(() => totalDuration(playlistSongs.value));

const formattedDate = computed(() => {
  if (!playlist.value?.createdAt) return '';
  return new Date(playlist.value.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
});

// Fuse search over catalog songs not yet in this playlist
const fuse = computed(() => new Fuse(allSongs.value, {
  keys: ['title', 'artist', 'genre', 'album'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const searchResults = computed(() => {
  const q = addSearch.value.trim();
  const base = q ? fuse.value.search(q).map(r => r.item) : allSongs.value;
  return base.slice(0, 50); // cap for performance
});

function isInPlaylist(songId) {
  return playlist.value?.songIds.includes(String(songId)) ?? false;
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleAddSong(songId) {
  await addSongToPlaylist(playlist.value.id, songId);
}

async function handleRemoveSong(songId) {
  await removeSongFromPlaylist(playlist.value.id, songId);
}

function startRename() {
  renameValue.value = playlist.value.name;
  renaming.value = true;
  nextTick(() => renameInput.value?.focus());
}

async function confirmRename() {
  const name = renameValue.value.trim();
  if (name && name !== playlist.value.name) {
    await renamePlaylist(playlist.value.id, name);
  }
  renaming.value = false;
}

function cancelRename() {
  renaming.value = false;
}

async function handleDelete() {
  if (!confirm(`Delete "${playlist.value.name}"? This cannot be undone.`)) return;
  await deletePlaylist(playlist.value.id);
  router.push('/playlists');
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadPlaylists();
  try {
    allSongs.value = await fetchSongs();
  } catch (e) {
    console.error('Failed to load songs:', e);
  }
});
</script>

<style scoped>
.is-selected-row td {
  opacity: 0.5;
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
