<template>
  <div class="app-shell">
    <nav class="navbar app-navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link class="navbar-item" to="/profile" aria-label="Home">
          <span class="app-brand">
            <span class="app-brand-mark">♫</span>
            <span>Note | Spotify Clone</span>
          </span>
        </router-link>
        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="mainNav">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="mainNav" class="navbar-menu">
        <div class="navbar-end app-nav-links">
          <router-link class="navbar-item nav-chip" to="/profile">Profile</router-link>
          <router-link class="navbar-item nav-chip" to="/songs">Songs</router-link>
          <router-link class="navbar-item nav-chip" to="/settings">Settings</router-link>
        </div>
      </div>
    </nav>

    <main class="section app-main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>
