<template>
  <div class="section-stack">

    <PageHero kicker="Preferences" title="Settings" subtitle="Adjust your profile name, bio, theme, font size, and accent color.">
      <span class="tag is-light settings-status-pill" style="background:var(--surface);border:1px solid var(--border);color:var(--muted);">
        {{ statusMessage || 'Changes save automatically' }}
      </span>
    </PageHero>

    <div class="columns is-variable is-4">

      <!-- Profile info -->
      <div class="column">
        <div class="box">
          <SectionTitle icon="person">Profile</SectionTitle>
          <div class="field mt-4">
            <label class="label">Display name</label>
            <div class="control">
              <input v-model="state.displayName" class="input" type="text" placeholder="Your name" />
            </div>
          </div>
          <div class="field">
            <label class="label">Bio</label>
            <div class="control">
              <textarea v-model="state.profileDescription" class="textarea" rows="4" placeholder="A short description"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Appearance -->
      <div class="column">
        <div class="box">
          <SectionTitle icon="appearance">Appearance</SectionTitle>

          <!-- Dark mode -->
          <div class="is-flex is-justify-content-space-between is-align-items-center py-3 mt-2"
               style="border-bottom:1px solid var(--border);">
            <div>
              <p class="has-text-weight-semibold">Dark mode</p>
              <p class="is-size-7" style="color:var(--muted);">Switch between light and dark interface.</p>
            </div>
            <label class="is-flex is-align-items-center" style="gap:0.5rem;cursor:pointer;">
              <span>{{ themeIcon }}</span>
              <input v-model="state.isDarkMode" type="checkbox" />
            </label>
          </div>

          <!-- Font size -->
          <div class="is-flex is-justify-content-space-between is-align-items-center py-3"
               style="border-bottom:1px solid var(--border);">
            <div>
              <p class="has-text-weight-semibold">Font size</p>
              <p class="is-size-7" style="color:var(--muted);">
                Preview: <span style="font-family:'DM Mono',monospace;">Enjoy your music</span>
              </p>
            </div>
            <div class="field has-addons mb-0">
              <div class="control">
                <button class="button is-light" @click="decreaseFont">A−</button>
              </div>
              <div class="control">
                <span class="button is-static" style="background:var(--surface-2);color:var(--text);border-color:var(--border);">
                  {{ state.fontSize }}px
                </span>
              </div>
              <div class="control">
                <button class="button is-light" @click="increaseFont">A+</button>
              </div>
            </div>
          </div>

          <!-- Accent colour -->
          <div class="pt-3">
            <SectionTitle icon="palette">Accent color</SectionTitle>
            <p class="is-size-7 mt-1 mb-3" style="color:var(--muted);">Used for buttons, highlights, and charts.</p>
            <div class="swatch-row">
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
          </div>
        </div>

        <!-- Actions -->
        <div class="is-flex is-justify-content-flex-end mt-3" style="gap:0.75rem;">
          <button class="button is-light"   @click="resetDefaults">Reset defaults</button>
          <button class="button is-success" @click="syncSettings">Save settings</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import $ from 'jquery';

import PageHero     from '../components/PageHero.vue';
import SectionTitle from '../components/SectionTitle.vue';

import { loadJSON, saveJSON } from '../api';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'spotifyClone.settings';
const DEFAULT_SETTINGS = {
  displayName:        'Guest',
  profileDescription: "We don't know much about Guest, but we're sure they have great music taste!",
  isDarkMode:   false,
  fontSize:     16,
  accentColor:  '#1db954',
};
const ACCENT_CHOICES = [
  { name: 'Spotify Green', value: '#1db954' },
  { name: 'Indigo',        value: '#5c6bc0' },
  { name: 'Violet',        value: '#7c3aed' },
  { name: 'Rose',          value: '#e11d48' },
  { name: 'Amber',         value: '#d97706' },
  { name: 'Sky',           value: '#0284c7' },
  { name: 'Emerald',       value: '#059669' },
  { name: 'Slate',         value: '#475569' },
];

// ── State ─────────────────────────────────────────────────────────────────────
const state         = reactive(loadJSON(STORAGE_KEY, DEFAULT_SETTINGS));
const statusMessage = ref('');
const accentChoices = ACCENT_CHOICES;

const themeIcon = computed(() => state.isDarkMode ? '🌙' : '☀️');

// ── Theme application ─────────────────────────────────────────────────────────
function applyTheme() {
  document.body.classList.toggle('theme-dark', Boolean(state.isDarkMode));
  document.documentElement.style.setProperty('--base-font-size', `${state.fontSize}px`);
  document.documentElement.style.setProperty('--accent',      state.accentColor);
  document.documentElement.style.setProperty('--accent-soft', `${state.accentColor}22`);
}

// ── Persistence ───────────────────────────────────────────────────────────────
function syncSettings() {
  const payload = {
    isDarkMode:         state.isDarkMode,
    fontSize:           state.fontSize,
    accentColor:        state.accentColor,
    displayName:        state.displayName,
    profileDescription: state.profileDescription,
  };
  saveJSON(STORAGE_KEY, payload);
  applyTheme();

  statusMessage.value = 'Saved ✓';
  window.clearTimeout(syncSettings._timer);
  // jQuery: fade the status pill out after a moment
  $('.settings-status-pill').stop(true).show();
  syncSettings._timer = window.setTimeout(() => {
    $('.settings-status-pill').fadeOut(500, function () {
      statusMessage.value = '';
      $(this).show(); // reset display for next save
    });
  }, 1200);
}

watch(state, () => syncSettings(), { deep: true, immediate: true });

// ── Actions ───────────────────────────────────────────────────────────────────
function setAccentColor(value) { state.accentColor = value; }

function resetDefaults() { Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_SETTINGS))); }

function increaseFont() { if (state.fontSize < 24) state.fontSize += 1; }
function decreaseFont() { if (state.fontSize > 12) state.fontSize -= 1; }

onMounted(applyTheme);
</script>
