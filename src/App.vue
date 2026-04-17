<template>
  <div class="app-shell">
    <nav class="navbar app-navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/profile" aria-label="Home">
          <span class="app-brand">
            <SvgIcon name="music" :size="22" class="app-brand-svg" />
            <span>Note | Spotify Clone</span>
          </span>
        </router-link>
        <a role="button" class="navbar-burger" id="navBurger"
           aria-label="menu" aria-expanded="false" data-target="mainNav">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="mainNav" class="navbar-menu">
        <div class="navbar-end" style="gap:0.5rem;padding-right:1rem;">
          <router-link class="navbar-item nav-chip" to="/songs">
            <SvgIcon name="music" :size="14" class="mr-1" />Songs
          </router-link>
          <router-link class="navbar-item nav-chip" to="/profile">
            <SvgIcon name="person" :size="14" class="mr-1" />Profile
          </router-link>
          <router-link class="navbar-item nav-chip" to="/playlists">
            <SvgIcon name="queue" :size="14" class="mr-1" />Playlists
          </router-link>
          <router-link class="navbar-item nav-chip" to="/settings">
            <SvgIcon name="settings" :size="14" class="mr-1" />Settings
          </router-link>
        </div>
      </div>
    </nav>

    <main class="section app-main" :class="{ 'has-player': hasPlayer }">
      <div class="container page-fade-in">
        <router-view />
      </div>
    </main>

    <MiniPlayer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import $ from 'jquery';
import SvgIcon from './components/SvgIcon.vue';
import MiniPlayer from './components/MiniPlayer.vue';
import { currentSong } from './store/player.js';
import { loadSongs } from './store/songs.js';

const hasPlayer = computed(() => currentSong.value !== null);

onMounted(() => {
  // Preload the song catalog once for the whole app
  loadSongs().catch(() => {});

  // jQuery: navbar burger toggle
  $('#navBurger').on('click', function () {
    $(this).toggleClass('is-active');
    $('#' + $(this).data('target')).toggleClass('is-active');
  });

  // jQuery: fade the page container in on load
  $('.page-fade-in').hide().fadeIn(350);
});
</script>

<style scoped>
.app-main {
  padding-top: 2rem;
  padding-bottom: 3rem;
  transition: padding-bottom 250ms ease;
}

/* Leave room for the fixed mini-player so content doesn't hide behind it */
.app-main.has-player {
  padding-bottom: 120px;
}
</style>
