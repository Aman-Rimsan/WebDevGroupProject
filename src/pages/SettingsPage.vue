<template>
  <div class="section-stack">
    <section class="page-hero">
      <div>
        <p class="page-kicker">Preferences</p>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">
          Adjust the profile name, bio, theme, font size, and accent color.
        </p>
      </div>
      <div class="soft-pill settings-status-pill">{{ statusMessage || 'Changes save automatically' }}</div>
    </section>

    <div class="theme-card-grid">
      <section class="box">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          Profile
        </div>
        <div class="form-grid">
          <div class="field">
            <label class="label">Display name</label>
            <input v-model="state.displayName" class="input" type="text" placeholder="Your name" />
          </div>
          <div class="field">
            <label class="label">Bio</label>
            <textarea v-model="state.profileDescription" class="textarea" rows="4" placeholder="A short description"></textarea>
          </div>
        </div>
      </section>

      <section class="box">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          Appearance
        </div>

        <div class="panel-card">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <div class="has-text-weight-semibold">Dark mode</div>
              <div class="helper-text">Switch between a light and dark interface.</div>
            </div>
            <label class="checkbox is-flex is-align-items-center" style="gap: 0.5rem;">
              <span>{{ themeIcon }}</span>
              <input v-model="state.isDarkMode" type="checkbox" />
            </label>
          </div>
        </div>

        <div class="panel-card">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <div class="has-text-weight-semibold">Font size</div>
              <div class="helper-text">
                Preview: <span style="font-family: 'DM Mono', monospace;">Enjoy your music experience</span>
              </div>
            </div>
            <div class="inline-actions">
              <button class="button is-light" @click="decreaseFont">A−</button>
              <span class="soft-pill">{{ state.fontSize }}px</span>
              <button class="button is-light" @click="increaseFont">A+</button>
            </div>
          </div>
        </div>
      </section>

      <section class="box">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style="margin-right:5px;vertical-align:middle;" aria-hidden="true">
            <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35 2.49 2.49 0 0 1-.36-3.14H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
          </svg>
          Accent color
        </div>
        <p class="helper-text">Choose the color used for actions and highlights.</p>
        <div class="swatch-row mt-4">
          <button
            v-for="choice in accentChoices"
            :key="choice.value"
            class="swatch"
            :class="{ 'is-active': state.accentColor === choice.value }"
            :title="choice.name"
            :style="{ background: choice.value }"
            @click="setAccentColor(choice.value)"
          ></button>
        </div>
      </section>

      <section class="inline-actions">
        <button class="button is-success" @click="syncSettings">Save settings</button>
        <button class="button is-light" @click="resetDefaults">Reset defaults</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import $ from 'jquery';
import { loadJSON, postJSON, saveJSON } from '../api';

const STORAGE_KEYS = {
  settings: 'spotifyClone.settings',
};

const DEFAULT_SETTINGS = {
  displayName: 'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
  isDarkMode: false,
  fontSize: 16,
  accentColor: '#1db954',
};

const ACCENT_CHOICES = [
  { name: 'Spotify Green', value: '#1db954' },
  { name: 'Indigo', value: '#5c6bc0' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Slate', value: '#475569' },
];

const state = reactive(loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
const statusMessage = ref('');
const themeIcon = computed(() => (state.isDarkMode ? '🌙' : '☀️'));
const accentChoices = ACCENT_CHOICES;

function applyTheme() {
  document.body.classList.toggle('theme-dark', Boolean(state.isDarkMode));
  document.documentElement.style.setProperty('--base-font-size', `${state.fontSize}px`);
  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--accent-soft', `${state.accentColor}22`);
}

function syncSettings() {
  const payload = {
    isDarkMode: state.isDarkMode,
    fontSize: state.fontSize,
    accentColor: state.accentColor,
    displayName: state.displayName,
    profileDescription: state.profileDescription,
  };

  saveJSON(STORAGE_KEYS.settings, payload);
  applyTheme();
  statusMessage.value = 'Saved locally ✓';
  window.clearTimeout(syncSettings._timer);
  $('.settings-status-pill').stop(true).fadeIn(0);
  syncSettings._timer = window.setTimeout(() => {
    $('.settings-status-pill').fadeOut(500, function () { statusMessage.value = ''; $(this).css('display', ''); });
  }, 1200);
}

watch(
  state,
  () => {
    syncSettings();
  },
  { deep: true, immediate: true },
);

function setAccentColor(value) {
  state.accentColor = value;
}

function resetDefaults() {
  Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
  syncSettings();
}

function increaseFont() {
  if (state.fontSize < 24) {
    state.fontSize += 1;
  }
}

function decreaseFont() {
  if (state.fontSize > 12) {
    state.fontSize -= 1;
  }
}

onMounted(() => {
  applyTheme();
});
</script>
