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
      <div class="soft-pill">{{ statusMessage || 'Changes save automatically' }}</div>
    </section>

    <div class="theme-card-grid">
      <section class="box">
        <div class="section-title">Profile</div>
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
        <div class="section-title">Appearance</div>

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
        <div class="section-title">Accent color</div>
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
  statusMessage.value = 'Saved locally';
  window.clearTimeout(syncSettings._timer);
  syncSettings._timer = window.setTimeout(() => {
    statusMessage.value = '';
  }, 1400);
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
