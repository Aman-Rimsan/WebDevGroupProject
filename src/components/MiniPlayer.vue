<template>
  <transition name="player-slide">
    <div v-if="currentSong" class="mini-player">
      <!-- Left: artwork + title/artist -->
      <div class="mini-player-info">
        <img :src="currentSong.artwork_link" :alt="currentSong.title" class="mini-player-cover" />
        <div class="mini-player-meta">
          <p class="mini-player-title">{{ currentSong.title }}</p>
          <p class="mini-player-artist">{{ currentSong.artist }}</p>
        </div>
      </div>

      <!-- Center: controls + progress -->
      <div class="mini-player-center">
        <div class="mini-player-controls">
          <button
            class="mini-player-action"
            :title="isPlaying ? 'Pause' : 'Play'"
            @click="togglePlayPause"
          >
            <SvgIcon :name="isPlaying ? 'pause' : 'play'" :size="22" />
          </button>
          <button class="mini-player-action-small" title="Stop" @click="stopPlayback">
            <SvgIcon name="stop" :size="14" />
          </button>
        </div>

        <div class="mini-player-progress">
          <span class="mini-player-time">{{ formatTime(currentTime) }}</span>
          <div
            ref="trackEl"
            class="mini-player-track"
            @click="handleSeek"
          >
            <div class="mini-player-track-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="mini-player-time">{{ formatTime(totalTime) }}</span>
        </div>

        <p v-if="queueContext" class="mini-player-context">
          {{ queueContext }}
          <span v-if="queue.length > 0"> · {{ queue.length }} up next</span>
        </p>
      </div>

      <!-- Right: close -->
      <div class="mini-player-side">
        <button class="mini-player-action-small" title="Close player" @click="stopPlayback">
          <SvgIcon name="close" :size="16" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import SvgIcon from './SvgIcon.vue';
import {
  currentSong, isPlaying, currentTime, totalTime,
  progressPercent, queue, queueContext,
  togglePlayPause, stopPlayback, seek,
} from '../store/player.js';

const trackEl = ref(null);

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

function handleSeek(event) {
  if (!trackEl.value) return;
  const rect = trackEl.value.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  seek(ratio * (totalTime.value || 30));
}
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(0, 2fr) minmax(60px, 1fr);
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(16px);
}

/* Left side */
.mini-player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.mini-player-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.mini-player-meta {
  min-width: 0;
}

.mini-player-title {
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.mini-player-artist {
  font-size: 0.82rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* Center */
.mini-player-center {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  min-width: 0;
}

.mini-player-controls {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.mini-player-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: filter 150ms ease, transform 150ms ease;
}

.mini-player-action:hover {
  filter: brightness(1.08);
  transform: scale(1.04);
}

.mini-player-action-small {
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
  transition: background 150ms ease, color 150ms ease;
}

.mini-player-action-small:hover {
  background: var(--surface-2);
  color: var(--text);
}

.mini-player-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 520px;
}

.mini-player-time {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: var(--muted);
  min-width: 2.5rem;
  text-align: center;
}

.mini-player-track {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.mini-player-track-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 100ms linear;
}

.mini-player-context {
  font-size: 0.7rem;
  color: var(--muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Right side */
.mini-player-side {
  display: flex;
  justify-content: flex-end;
  gap: 0.3rem;
}

/* Slide transition */
.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 250ms ease, opacity 250ms ease;
}
.player-slide-enter-from,
.player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Mobile */
@media (max-width: 720px) {
  .mini-player {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
  .mini-player-side { display: none; }
}
</style>
