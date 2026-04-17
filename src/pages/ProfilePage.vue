<template>
  <div class="section-stack">

    <PageHero
      kicker="Profile"
      title="Your profile"
      subtitle="Your favorite songs, artists, and playlists."
    />

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
          <div class="stat-card stat-card-anim">
            <SvgIcon name="music" :size="22" class="stat-icon" />
            <span class="stat-value">{{ favoriteSongsData.length }}</span>
            <span class="stat-label">Favorite songs</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card stat-card-anim" style="animation-delay: 80ms;">
            <SvgIcon name="person" :size="22" class="stat-icon" />
            <span class="stat-value">{{ profile.favoriteArtists.length }}</span>
            <span class="stat-label">Favorite artists</span>
          </div>
        </div>
        <div class="column">
          <div class="stat-card stat-card-anim" style="animation-delay: 160ms;">
            <SvgIcon name="queue" :size="22" class="stat-icon" />
            <span class="stat-value">{{ playlists.length }}</span>
            <span class="stat-label">Playlists</span>
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
        @pick="song => toggleFavoriteSong(song.id)"
      />

      <div class="mt-3" style="padding: 0.25rem 0;">
        <SongRow
          v-for="song in favoriteSongsData"
          :key="song.id"
          :song="song"
          :show-like="false"
          :show-remove="true"
          remove-title="Remove from favorites"
          :show-genre="false"
          :show-duration="false"
          :play-context="{ songs: favoriteSongsData, index: favoriteSongsData.indexOf(song), label: 'Your favorite songs' }"
          @remove="removeFavoriteSong(song.id)"
        />
        <p v-if="favoriteSongsData.length === 0" class="has-text-centered py-4 is-size-7" style="color:var(--muted);">
          No favorite songs yet. Search above to add one.
        </p>
      </div>
    </div>

    <!-- Favorite artists -->
    <div class="box">
      <SectionTitle icon="person">Favorite artists</SectionTitle>

      <!-- Artist live-search picker -->
      <div class="artist-picker mt-3">
        <div class="field">
          <div class="control has-icons-left">
            <input
              v-model="artistQuery"
              class="input"
              type="text"
              placeholder="Search for an artist to add…"
              @focus="artistFocused = true"
              @blur="handleArtistBlur"
            />
            <span class="icon is-left" style="color:var(--muted);">
              <SvgIcon name="search" :size="14" />
            </span>
          </div>
        </div>

        <div v-if="artistFocused && artistQuery.trim() && artistResults.length > 0" class="song-picker-results">
          <button
            v-for="artist in artistResults"
            :key="artist"
            class="song-picker-result"
            @mousedown.prevent="pickArtist(artist)"
          >
            <div class="artist-picker-avatar">
              <img
                v-if="artistFirstSong.get(artist)"
                :src="artistFirstSong.get(artist).artwork_link"
                :alt="artist"
              />
              <span v-else>{{ artist.charAt(0) }}</span>
            </div>
            <div class="song-picker-meta">
              <p class="song-picker-title">{{ artist }}</p>
              <p class="song-picker-artist">
                {{ artistSongCount(artist) }} song{{ artistSongCount(artist) === 1 ? '' : 's' }} in catalog
              </p>
            </div>
            <span v-if="profile.favoriteArtists.includes(artist)" class="tag is-success is-light" style="font-size:0.7rem;">
              Added
            </span>
          </button>
        </div>
        <p v-else-if="artistFocused && artistQuery.trim() && artistResults.length === 0"
           class="song-picker-empty">
          No artists matched "{{ artistQuery }}".
        </p>
      </div>

      <div class="mt-3" style="padding: 0.25rem 0;">
        <ArtistRow
          v-for="artist in profile.favoriteArtists"
          :key="artist"
          :artist="artist"
          @remove="removeFavoriteArtist(artist)"
        />
        <p v-if="profile.favoriteArtists.length === 0" class="has-text-centered py-4 is-size-7" style="color:var(--muted);">
          No favorite artists yet. Search above to add one.
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
placeholder='e.g. "Late Night Drives", "Workout Mix"…'
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
      <SectionTitle icon="pie-chart">Favorite genres</SectionTitle>
      <p class="is-size-7 mb-3 mt-1" style="color:var(--muted);">Derived from your favorited songs. Hover a slice to inspect.</p>
      <D3DonutChart :data="donutData" empty-message="Add favorite songs to see your genre breakdown." />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Fuse from 'fuse.js';

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
  songs as songsCatalog, uniqueArtists, songsById, artistFirstSong, loadSongs,
} from '../store/songs.js';
import {
  profile, favoriteSongIds,
  loadProfile, toggleFavoriteSong, removeFavoriteSong,
  addFavoriteArtist, removeFavoriteArtist,
} from '../store/profile.js';
import { playlists, loadPlaylists, createPlaylist } from '../store/playlists.js';

// ── Settings (for display name / bio) ─────────────────────────────────────────
const SETTINGS_KEY = 'spotifyClone.settings';
const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
};
const settings = reactive(loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS));

// ── Local input state ─────────────────────────────────────────────────────────
const artistQuery   = ref('');
const artistFocused = ref(false);
const playlistInput = ref('');

// ── Computed ──────────────────────────────────────────────────────────────────
const displayName = computed(() => settings.displayName?.trim() || 'Guest');
const bio         = computed(() => settings.profileDescription?.trim() || DEFAULT_SETTINGS.profileDescription);
const initials    = computed(() =>
  String(displayName.value || 'G').split(/\s+/).filter(Boolean).slice(0, 2)
    .map(p => p[0]).join('').toUpperCase() || 'G'
);

// Hydrate favorite song IDs into full song objects
const favoriteSongsData = computed(() =>
  profile.value.favoriteSongIds.map(id => songsById.value.get(id)).filter(Boolean)
);

// Donut chart data
const donutData = computed(() => {
  const counts = new Map();
  for (const song of favoriteSongsData.value) {
    const g = song.genre || 'Unknown';
    counts.set(g, (counts.get(g) || 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
});

// Artist Fuse search
const artistFuse = computed(() => new Fuse(uniqueArtists.value, {
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const artistResults = computed(() => {
  const q = artistQuery.value.trim();
  if (!q) return [];
  return artistFuse.value.search(q).map(r => r.item).slice(0, 8);
});

function artistSongCount(artist) {
  return songsCatalog.value.filter(s => s.artist === artist).length;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function pickArtist(artist) {
  if (!profile.value.favoriteArtists.includes(artist)) {
    addFavoriteArtist(artist);
  }
  // Clear the query but keep focus on the input so the user can keep searching.
  // artistFocused stays true — handleArtistBlur handles closing when focus
  // genuinely leaves. The mousedown.prevent on result buttons prevents blur firing.
  artistQuery.value = '';
}

function handleArtistBlur() {
  setTimeout(() => { artistFocused.value = false; }, 150);
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
});
</script>

<style scoped>
/* ── Stat card CSS animation — runs once on mount, no JS needed ─────── */
@keyframes stat-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card-anim {
  opacity: 0;
  animation: stat-fade-up 350ms ease forwards;
}

/* ── Artist picker — reuses SongSearchPicker visual style ────────────── */
.artist-picker {
  position: relative;
}

.artist-picker-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--accent);
  font-size: 0.9rem;
}

.artist-picker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Inherit dropdown styles from SongSearchPicker (global in app.css
   because SongSearchPicker uses <style scoped> — we duplicate the
   positioning rules here for the artist variant) */
.song-picker-results {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  max-height: 320px;
  overflow-y: auto;
  z-index: 10;
}

.song-picker-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: var(--text);
  transition: background 120ms ease;
}

.song-picker-result:hover {
  background: var(--surface-2);
}

.song-picker-meta {
  min-width: 0;
  flex: 1;
}

.song-picker-title {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.song-picker-artist {
  font-size: 0.78rem;
  color: var(--muted);
  margin: 0;
}

.song-picker-empty {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  padding: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
  z-index: 10;
}
</style>
