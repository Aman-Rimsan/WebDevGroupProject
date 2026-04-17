<template>
  <div class="song-picker">
    <div class="field">
      <div class="control has-icons-left">
        <input
          v-model="query"
          class="input"
          type="text"
          :placeholder="placeholder"
          @focus="isFocused = true"
          @blur="handleBlur"
        />
        <span class="icon is-left" style="color:var(--muted);">
          <SvgIcon name="search" :size="14" />
        </span>
      </div>
    </div>

    <div v-if="isFocused && query.trim() && results.length > 0" class="song-picker-results">
      <button
        v-for="song in results"
        :key="song.id"
        class="song-picker-result"
        @mousedown.prevent="handlePick(song)"
      >
        <img :src="song.artwork_link" :alt="song.title" class="song-picker-art" />
        <div class="song-picker-meta">
          <p class="song-picker-title">{{ song.title }}</p>
          <p class="song-picker-artist">{{ song.artist }}</p>
        </div>
      </button>
    </div>
    <p v-else-if="isFocused && query.trim() && results.length === 0" class="song-picker-empty">
      No matches.
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Fuse from 'fuse.js';
import SvgIcon from './SvgIcon.vue';

const props = defineProps({
  // Source catalog to search through
  songs:       { type: Array,  required: true },
  // Set of song IDs to exclude (already favorited / in playlist etc.)
  excludeIds:  { type: Array,  default: () => [] },
  placeholder: { type: String, default: 'Search for a song…' },
  limit:       { type: Number, default: 8 },
});

const emit = defineEmits(['pick']);

const query     = ref('');
const isFocused = ref(false);

const fuse = computed(() => new Fuse(props.songs, {
  keys: ['title', 'artist', 'album'],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}));

const results = computed(() => {
  const q = query.value.trim();
  if (!q) return [];
  const excluded = new Set(props.excludeIds);
  return fuse.value.search(q)
    .map(r => r.item)
    .filter(s => !excluded.has(s.id))
    .slice(0, props.limit);
});

function handlePick(song) {
  emit('pick', song);
  query.value = '';
}

// Delay blur so the mousedown handler on results fires first
function handleBlur() {
  setTimeout(() => { isFocused.value = false; }, 150);
}
</script>

<style scoped>
.song-picker {
  position: relative;
}

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

.song-picker-art {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
