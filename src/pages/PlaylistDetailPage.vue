<template>
  <div class="section-stack" v-if="playlist">

    <!-- Header -->
    <div class="page-hero">
      <div style="flex:1;min-width:0;">
        <p class="page-kicker">Playlist</p>

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
        <h1 v-else class="page-title" style="cursor:pointer;" @click="startRename" title="Click to rename">
          {{ playlist.name }}
          <SvgIcon name="edit" :size="18" style="opacity:0.35;vertical-align:middle;margin-left:0.4rem;" />
        </h1>

        <p class="page-subtitle mt-1">
          {{ playlistSongs.length }} {{ playlistSongs.length === 1 ? 'song' : 'songs' }}
          <template v-if="playlistSongs.length > 0"> · {{ duration }}</template>
          · Created {{ formattedDate }}
        </p>
      </div>

      <div class="is-flex" style="gap:0.5rem;flex-shrink:0;flex-wrap:wrap;">
        <button
          v-if="playableSongs.length > 0"
          class="button is-success"
          @click="playAll"
          title="Play all songs"
        >
          <SvgIcon name="play" :size="14" class="mr-2" />Play all
        </button>
        <router-link class="button is-light" to="/playlists">
          <SvgIcon name="queue" :size="14" class="mr-2" />All playlists
        </router-link>
        <button class="button is-danger is-light" @click="handleDelete">
          <SvgIcon name="trash" :size="14" class="mr-2" />Delete
        </button>
      </div>
    </div>

    <!-- Song list -->
    <div class="box" style="padding: 0.5rem;">
      <SongRow
        v-for="(song, idx) in playlistSongs"
        :key="song.id"
        :song="song"
        :is-liked="favoriteSongIds.has(song.id)"
        :show-remove="true"
        remove-title="Remove from playlist"
        :play-context="{ songs: playlistSongs, index: idx, label: `Playlist: ${playlist.name}` }"
        @remove="handleRemoveSong(song.id)"
        @toggle-like="handleToggleLike(song.id)"
      />
      <p v-if="playlistSongs.length === 0" class="has-text-centered py-5" style="color:var(--muted);">
        No songs yet. Add some below.
      </p>
    </div>

    <!-- Add songs from catalog -->
    <div class="box">
      <SectionTitle icon="plus">Add songs</SectionTitle>

      <SongSearchPicker
        :songs="allSongs"
        :exclude-ids="playlist.songIds"
        placeholder="Search by title, artist, or genre to add a song…"
        class="mt-3"
        @pick="handleAddSong"
      />

      <p class="is-size-7 mt-2" style="color:var(--muted);">
        {{ allSongs.length.toLocaleString() }} songs in the catalog. Already-added songs are hidden.
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

import SectionTitle     from '../components/SectionTitle.vue';
import SvgIcon          from '../components/SvgIcon.vue';
import SongRow          from '../components/SongRow.vue';
import SongSearchPicker from '../components/SongSearchPicker.vue';

import {
  playlists, loadPlaylists, renamePlaylist, deletePlaylist,
  addSongToPlaylist, removeSongFromPlaylist, getPlaylist,
} from '../store/playlists.js';
import { songs as allSongs, songsById, loadSongs } from '../store/songs.js';
import { favoriteSongIds, toggleFavoriteSong } from '../store/profile.js';
import { totalDuration } from '../utils/duration.js';
import { playQueue } from '../store/player.js';

const route  = useRoute();
const router = useRouter();

const renaming    = ref(false);
const renameValue = ref('');
const renameInput = ref(null);

const playlist = computed(() => getPlaylist(route.params.id));

const playlistSongs = computed(() => {
  if (!playlist.value) return [];
  return playlist.value.songIds
    .map(id => songsById.value.get(id))
    .filter(Boolean);
});

const playableSongs = computed(() => playlistSongs.value.filter(s => s.preview_url));

const duration = computed(() => totalDuration(playlistSongs.value));

const formattedDate = computed(() => {
  if (!playlist.value?.createdAt) return '';
  return new Date(playlist.value.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleAddSong(song) {
  await addSongToPlaylist(playlist.value.id, song.id);
}

async function handleRemoveSong(songId) {
  await removeSongFromPlaylist(playlist.value.id, songId);
}

function handleToggleLike(songId) {
  toggleFavoriteSong(songId);
}

function playAll() {
  if (playableSongs.value.length === 0) return;
  playQueue(playlistSongs.value, 0, `Playlist: ${playlist.value.name}`);
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
  await loadSongs();
});
</script>
