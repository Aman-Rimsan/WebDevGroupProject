<template>
  <div class="section-stack">

    <PageHero kicker="Library" title="Your Playlists" subtitle="Create and manage your personal playlists. Click any playlist to view and edit its songs.">
      <div class="tags has-addons" style="margin:0">
        <span class="tag is-light" style="background:var(--surface);border:1px solid var(--border);color:var(--muted);">Playlists</span>
        <span class="tag" style="background:var(--accent);color:#fff;">{{ playlists.length }}</span>
      </div>
    </PageHero>

    <!-- Create new playlist -->
    <div class="box">
      <SectionTitle icon="plus">New playlist</SectionTitle>
      <div class="field has-addons mt-3">
        <div class="control is-expanded">
          <input
            v-model="newName"
            class="input"
            type="text"
            placeholder='e.g. "Late Night Drives", "Workout Mix"…'
            @keyup.enter="handleCreate"
          />
        </div>
        <div class="control">
          <button class="button is-success" :disabled="!newName.trim()" @click="handleCreate">
            Create
          </button>
        </div>
      </div>
      <p v-if="createError" class="has-text-danger is-size-7 mt-2">{{ createError }}</p>
    </div>

    <!-- Loading / error states -->
    <p v-if="playlistsLoading" class="is-size-7" style="color:var(--muted);">Loading playlists…</p>
    <p v-else-if="playlistsError" class="has-text-danger is-size-7">{{ playlistsError }}</p>

    <!-- Empty state -->
    <div v-else-if="playlists.length === 0" class="box has-text-centered py-6">
      <SvgIcon name="queue" :size="48" style="color:var(--muted);opacity:0.4;display:block;margin:0 auto 1rem;" />
      <p class="has-text-weight-semibold">No playlists yet</p>
      <p class="is-size-7 mt-1" style="color:var(--muted);">Create your first one above.</p>
    </div>

    <!-- Playlist grid -->
    <div v-else class="columns is-multiline is-variable is-4">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="column is-4-desktop is-6-tablet is-12-mobile"
      >
        <PlaylistCard :playlist="playlist" :songs="songs" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import PageHero     from '../components/PageHero.vue';
import SectionTitle from '../components/SectionTitle.vue';
import SvgIcon      from '../components/SvgIcon.vue';
import PlaylistCard from '../components/PlaylistCard.vue';

import { playlists, playlistsLoading, playlistsError, loadPlaylists, createPlaylist } from '../store/playlists.js';
import { fetchSongs } from '../api.js';

const router     = useRouter();
const newName    = ref('');
const createError = ref('');
const songs      = ref([]);

async function handleCreate() {
  const name = newName.value.trim();
  if (!name) return;
  if (playlists.value.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    createError.value = 'A playlist with that name already exists.';
    return;
  }
  createError.value = '';
  const pl = await createPlaylist(name);
  newName.value = '';
  // Navigate straight to the new playlist's detail page
  router.push(`/playlists/${pl.id}`);
}

onMounted(async () => {
  await loadPlaylists();
  try {
    songs.value = await fetchSongs();
  } catch (e) {
    console.error('Failed to load songs for duration display', e);
  }
});
</script>
