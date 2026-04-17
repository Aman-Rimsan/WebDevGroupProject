<template>
  <div class="song-row" :class="{ 'is-playing': isCurrent }">
    <!-- Cover art with hover-to-play overlay -->
    <div class="song-row-cover">
      <img :src="song.artwork_link" :alt="song.title" loading="lazy" />
      <button
        v-if="song.preview_url"
        class="song-row-play-btn"
        :class="{ 'always-visible': isCurrent }"
        :title="isActivelyPlaying ? 'Pause' : 'Play preview'"
        @click.stop="handlePlay"
      >
        <SvgIcon :name="isActivelyPlaying ? 'pause' : 'play'" :size="18" />
      </button>
      <!-- Equalizer animation, shown when the song is actively playing -->
      <div v-if="isActivelyPlaying" class="song-row-eq" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Title + artist -->
    <div class="song-row-info">
      <p class="song-row-title">{{ song.title }}</p>
      <p class="song-row-artist">{{ song.artist }}</p>
    </div>

    <!-- Genre tag -->
    <div v-if="showGenre && song.genre" class="song-row-genre">
      <span class="tag is-light">{{ song.genre }}</span>
    </div>

    <!-- Duration -->
    <div v-if="showDuration" class="song-row-duration">{{ song.duration }}</div>

    <!-- Actions -->
    <div class="song-row-actions" @click.stop>
      <!-- Like / favorite -->
      <button
        v-if="showLike"
        class="song-row-action"
        :class="{ 'is-liked': isLiked }"
        :title="isLiked ? 'Unfavorite' : 'Favorite'"
        @click="$emit('toggle-like', song)"
      >
        <SvgIcon :name="isLiked ? 'heart-filled' : 'heart'" :size="16" />
      </button>

      <!-- Remove from current context (playlist / favorites) -->
      <button
        v-if="showRemove"
        class="song-row-action song-row-action-danger"
        :title="removeTitle"
        @click="$emit('remove', song)"
      >
        <SvgIcon name="close" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { playSong, playQueue, isCurrentSong, isPlayingSong } from '../store/player.js';

const props = defineProps({
  song: { required: true },
  isLiked: { default: false },
  showLike: { default: true },
  showRemove: { default: false },
  removeTitle: { default: 'Remove' },
  showGenre: { default: true },
  showDuration: { default: true },
  // When set, play triggers a queue instead of a single track.
  playContext: { default: null },
});

defineEmits(['toggle-like', 'remove']);

const isCurrent = computed(() => isCurrentSong(props.song));
const isActivelyPlaying = computed(() => isPlayingSong(props.song));

function handlePlay() {
  if (!props.song.preview_url) return;
  props.playContext
    ? playQueue(props.playContext.songs, props.playContext.index, props.playContext.label)
    : playSong(props.song);
}
</script>

<style scoped>
.song-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  transition: background 150ms ease;
  position: relative;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.song-row:hover {
  background: var(--surface-2);
}

.song-row.is-playing {
  background: var(--accent-soft);
}

.song-row.is-playing .song-row-title {
  color: var(--accent);
}

.song-row-cover {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
}

.song-row-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.song-row-play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms ease;
}

.song-row:hover .song-row-play-btn,
.song-row-play-btn.always-visible {
  opacity: 1;
}

.song-row-eq {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 14px;
  pointer-events: none;
}

.song-row-eq span {
  display: block;
  width: 3px;
  background: var(--accent);
  animation: eq-bounce 900ms ease-in-out infinite;
}

.song-row-eq span:nth-child(1) { animation-delay: 0ms; }
.song-row-eq span:nth-child(2) { animation-delay: 150ms; }
.song-row-eq span:nth-child(3) { animation-delay: 300ms; }

/* Hide equalizer when play button is being hovered */
.song-row:hover .song-row-eq { opacity: 0.4; }

@keyframes eq-bounce {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

.song-row-info {
  flex: 1;
  min-width: 0;
}

.song-row-title {
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.song-row-artist {
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.song-row-genre {
  flex-shrink: 0;
}

.song-row-genre .tag {
  background: var(--surface-2) !important;
  color: var(--muted) !important;
  border: 1px solid var(--border) !important;
  font-size: 0.72rem;
}

.song-row-duration {
  font-family: 'DM Mono', monospace;
  font-size: 0.82rem;
  color: var(--muted);
  flex-shrink: 0;
  min-width: 3rem;
  text-align: right;
}

.song-row-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 150ms ease;
}

.song-row:hover .song-row-actions { opacity: 1; }

.song-row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.song-row-action:hover {
  background: var(--surface-3);
  color: var(--text);
}

.song-row-action.is-liked {
  color: #ef4444;
  opacity: 1;
}

.song-row-action-danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* Mobile: Hide secondary columns so row fits in viewport */
@media (max-width: 600px) {
  .song-row { gap: 0.5rem; }
  .song-row-genre,
  .song-row-duration { display: none; }
  .song-row-actions { opacity: 1; }
}
</style>
