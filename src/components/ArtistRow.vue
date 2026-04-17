<template>
  <div class="artist-row">
    <div class="artist-row-avatar">
      <img v-if="imageUrl" :src="imageUrl" :alt="artist" />
      <div v-else class="artist-row-avatar-fallback">{{ initial }}</div>
    </div>
    <div class="artist-row-info">
      <p class="artist-row-name">{{ artist }}</p>
      <p class="artist-row-meta">{{ songCount }} {{ songCount === 1 ? 'song' : 'songs' }} in catalog</p>
    </div>
    <button
      v-if="showRemove"
      class="artist-row-remove"
      title="Remove from favorites"
      @click="$emit('remove')"
    >
      <SvgIcon name="close" :size="16" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { artistFirstSong, songs as catalog } from '../store/songs.js';

const props = defineProps({
  artist: { required: true },
  showRemove: { default: true },
});

defineEmits(['remove']);

const imageUrl = computed(() => artistFirstSong.value.get(props.artist)?.artwork_link || '');
const initial = computed(() => (props.artist || '?').charAt(0).toUpperCase());
const songCount = computed(() => catalog.value.filter(s => s.artist === props.artist).length);
</script>

<style scoped>
.artist-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  transition: background 150ms ease;
}

.artist-row:hover {
  background: var(--surface-2);
}

.artist-row-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
}

.artist-row-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-row-avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--accent);
  font-weight: 700;
  background: var(--accent-soft);
}

.artist-row-info {
  flex: 1;
  min-width: 0;
}

.artist-row-name {
  font-weight: 600;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-row-meta {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 0;
}

.artist-row-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: background 150ms ease, color 150ms ease, opacity 150ms ease;
}

.artist-row:hover .artist-row-remove { opacity: 1; }

.artist-row-remove:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
</style>
