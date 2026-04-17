<template>
  <div class="section-stack">

    <PageHero
      kicker="Profile"
      title="Your music home"
      subtitle="Your favorite songs, artists, and playlists in one place."
    >
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
            <SvgIcon name="music" :size="22" class="stat-icon" />
            <span class="stat-value">{{ favoriteSongsData.length }}</span>
            <span class="stat-label">Favorite songs</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="person" :size="22" class="stat-icon" />
            <span class="stat-value">{{ profile.favoriteArtists.length }}</span>
            <span class="stat-label">Favorite artists</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="queue" :size="22" class="stat-icon" />
            <span class="stat-value">{{ playlists.length }}</span>
            <span class="stat-label">Playlists</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card">
            <SvgIcon name="group" :size="22" class="stat-icon" />
            <span class="stat-value">0</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite songs -->
    <div class="box">
      <SectionTitle icon="heart-filled">Favorite songs</SectionTitle>

      <SongSearchPicker
        :songs="songsCatalog"
        :exclude-ids="profile.favoriteSongIds"
        placeholder="Search the catalog to add a favorite song…"
        class="mt-3"
        @pick="handleFavoriteSong"
      />

      <div class="mt-3" style="padding: 0.25rem 0;">
        <SongRow
          v-for="song in favoriteSongsData"
          :key="song.id"
          :song="song"
          :is-liked="true"
          :show-remove="true"
          remove-title="Remove from favorites"
          :show-genre="false"
          :show-duration="false"
          :play-context="{ songs: favoriteSongsData, index: favoriteSongsData.indexOf(song), label: 'Your favorite songs' }"
          @remove="removeFavoriteSong(song.id)"
          @toggle-like="toggleFavoriteSong(song.id)"
        />
        <p v-if="favoriteSongsData.length === 0" class="has-text-centered py-4 is-size-7" style="color:var(--muted);">
          No favorite songs yet. Search above to add one.
        </p>
      </div>
    </div>

    <!-- Favorite artists -->
    <div class="box">
      <SectionTitle icon="person">Favorite artists</SectionTitle>

      <div class="field has-addons mt-3">
        <div class="control is-expanded has-icons-left">
          <input
            v-model="artistInput"
            class="input"
            type="text"
            placeholder="Type an artist name and press Add"
            list="catalog-artists"
            @keyup.enter="addArtist"
          />
          <datalist id="catalog-artists">
            <option v-for="artist in uniqueArtists.slice(0, 200)" :key="artist" :value="artist" />
          </datalist>
          <span class="icon is-left" style="color:var(--muted);">
            <SvgIcon name="search" :size="14" />
          </span>
        </div>
        <div class="control">
          <button class="button is-success" :disabled="!artistInput.trim()" @click="addArtist">Add</button>
        </div>
      </div>

      <div class="mt-3" style="padding: 0.25rem 0;">
        <ArtistRow
          v-for="artist in profile.favoriteArtists"
          :key="artist"
          :artist="artist"
          @remove="removeFavoriteArtist(artist)"
        />
        <p v-if="profile.favoriteArtists.length === 0" class="has-text-centered py-4 is-size-7" style="color:var(--muted);">
          No favorite artists yet. Add one above.
        </p>
      </div>
    </div>

    <!-- Playlists -->
    <div class="box">
      <SectionTitle icon="queue">Playlists</SectionTitle>
      <div class="field has-addons mt-3">
        <div class="control is-expanded">
          <input
            v-model="playlistInput"
            class="input"
            type="text"
            placeholder="New playlist name"
            @keyup.enter="handleCreatePlaylist"
          />
        </div>
        <div class="control">
          <button class="button is-success" :disabled="!playlistInput.trim()" @click="handleCreatePlaylist">Add</button>
        </div>
      </div>

      <div v-if="playlists.length > 0" class="columns is-multiline is-variable is-3 mt-3">
        <div v-for="pl in playlists" :key="pl.id" class="column is-6">
          <PlaylistCard :playlist="pl" :songs="songsCatalog" />
        </div>
      </div>
      <p v-else class="is-size-7 mt-3" style="color:var(--muted);">No playlists yet.</p>

      <router-link to="/playlists" class="button is-light is-fullwidth mt-3" style="font-size:0.875rem;">
        <SvgIcon name="queue" :size="13" class="mr-2" />Manage all playlists
      </router-link>
    </div>

    <!-- Genres donut chart -->
    <div class="box" v-if="favoriteSongsData.length > 0">
      <SectionTitle icon="pie-chart">Favorite Genres</SectionTitle>
      <p class="is-size-7 mb-3 mt-1" style="color:var(--muted);">Derived from your favorited songs. Hover a slice to inspect.</p>
      <D3DonutChart :data="donutData" empty-message="Add favorite songs to see your genre breakdown." />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import $ from 'jquery';

import PageHero         from '../components/PageHero.vue';
import SectionTitle     from '../components/SectionTitle.vue';
import SvgIcon          from '../components/SvgIcon.vue';
import SongRow          from '../components/SongRow.vue';
import SongSearchPicker from '../components/SongSearchPicker.vue';
import ArtistRow        from '../components/ArtistRow.vue';
import D3DonutChart     from '../components/D3DonutChart.vue';
import PlaylistCard     from '../components/PlaylistCard.vue';

import { loadJSON } from '../api';
import {
  songs as songsCatalog, uniqueArtists, songsById, loadSongs,
} from '../store/songs.js';
import {
  profile, favoriteSongIds,
  loadProfile, toggleFavoriteSong, removeFavoriteSong,
  addFavoriteArtist, removeFavoriteArtist,
} from '../store/profile.js';
import { playlists, loadPlaylists, createPlaylist } from '../store/playlists.js';

// ── Local input state ─────────────────────────────────────────────────────────
const SETTINGS_KEY = 'spotifyClone.settings';
const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
};
const settings = reactive(loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS));

const artistInput   = ref('');
const playlistInput = ref('');

// ── Computed ──────────────────────────────────────────────────────────────────
const displayName = computed(() => settings.displayName?.trim() || 'Guest');
const bio         = computed(() => settings.profileDescription?.trim() || DEFAULT_SETTINGS.profileDescription);
const initials = computed(() =>
  String(displayName.value || 'G').split(/\s+/).filter(Boolean).slice(0, 2)
    .map(p => p[0]).join('').toUpperCase() || 'G'
);

// Hydrate favorite song IDs into full song objects from the catalog
const favoriteSongsData = computed(() =>
  profile.value.favoriteSongIds
    .map(id => songsById.value.get(id))
    .filter(Boolean)
);

// Donut: group favorite songs by genre
const donutData = computed(() => {
  const counts = new Map();
  for (const song of favoriteSongsData.value) {
    const g = song.genre || 'Unknown';
    counts.set(g, (counts.get(g) || 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
});

// ── Actions ───────────────────────────────────────────────────────────────────
function handleFavoriteSong(song) {
  toggleFavoriteSong(song.id);
}

function addArtist() {
  const name = artistInput.value.trim();
  if (!name) return;
  addFavoriteArtist(name);
  artistInput.value = '';
}

async function handleCreatePlaylist() {
  const name = playlistInput.value.trim();
  if (!name) return;
  await createPlaylist(name);
  playlistInput.value = '';
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadSongs();
  await loadPlaylists();
  loadProfile();

  // jQuery: staggered fade-in for stat cards
  $('.stat-card').css({ opacity: 0 });
  $('.stat-card').each(function (i) {
    $(this).delay(i * 80).animate({ opacity: 1 }, 400);
  });
});
</script>
