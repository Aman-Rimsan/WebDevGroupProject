<template>
  <div class="app-shell">
    <nav class="navbar app-navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/profile" aria-label="Home">
          <span class="app-brand">
            <!-- SVG: Music note logo -->
            <svg class="app-brand-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
              <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z"/>
            </svg>
            <span>Note | Spotify Clone</span>
          </span>
        </router-link>
        <a role="button" class="navbar-burger" id="navBurger" aria-label="menu" aria-expanded="false" data-target="mainNav">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="mainNav" class="navbar-menu">
        <div class="navbar-end app-nav-links">
          <router-link class="navbar-item nav-chip" to="/profile">
            <!-- SVG: Person icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true" style="margin-right:5px;vertical-align:middle;">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            Profile
          </router-link>
          <router-link class="navbar-item nav-chip" to="/songs">
            <!-- SVG: Music note icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true" style="margin-right:5px;vertical-align:middle;">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
            </svg>
            Songs
          </router-link>
          <router-link class="navbar-item nav-chip" to="/settings">
            <!-- SVG: Gear/settings icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true" style="margin-right:5px;vertical-align:middle;">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
            </svg>
            Settings
          </router-link>
        </div>
      </div>
    </nav>

    <main class="section app-main">
      <div class="container page-fade-in">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import $ from 'jquery';

onMounted(() => {
  // jQuery: navbar burger toggle
  $('#navBurger').on('click', function () {
    const $burger = $(this);
    const $menu = $('#' + $burger.data('target'));
    $burger.toggleClass('is-active');
    $menu.toggleClass('is-active');
  });

  // jQuery: fade-in the page container on each navigation
  $('.page-fade-in').hide().fadeIn(350);
});
</script>
