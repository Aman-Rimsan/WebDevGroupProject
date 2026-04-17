import { ref, computed } from 'vue';

// ── State ─────────────────────────────────────────────────────────────────────
export const currentSong  = ref(null);   // Song object currently loaded
export const isPlaying    = ref(false);
export const currentTime  = ref(0);      // seconds
export const totalTime    = ref(0);      // seconds (capped at 30 for previews)
export const queue        = ref([]);     // Remaining songs to auto-advance through
export const queueContext = ref('');     // Label, e.g. "Playlist: Chill Vibes" — used in UI

// ── Private audio element ─────────────────────────────────────────────────────
let audio = null;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime;
  });
  audio.addEventListener('loadedmetadata', () => {
    totalTime.value = audio.duration || 30;
  });
  audio.addEventListener('ended', () => {
    // Auto-advance if we have a queue, otherwise stop
    if (queue.value.length > 0) {
      const next = queue.value.shift();
      _loadAndPlay(next);
    } else {
      isPlaying.value = false;
      currentTime.value = 0;
    }
  });
  audio.addEventListener('play',  () => { isPlaying.value = true; });
  audio.addEventListener('pause', () => { isPlaying.value = false; });
  audio.addEventListener('error', () => {
    console.error('Audio playback error');
    isPlaying.value = false;
  });

  return audio;
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function _loadAndPlay(song) {
  const el = ensureAudio();
  currentSong.value = song;
  currentTime.value = 0;
  totalTime.value   = 30;
  el.src = song.preview_url;
  el.play().catch(err => {
    console.error('Failed to play audio:', err);
    isPlaying.value = false;
  });
}

// ── Public actions ────────────────────────────────────────────────────────────

/**
 * Play a single song. If already playing the same song, toggle pause/resume.
 */
export function playSong(song) {
  if (!song || !song.preview_url) return;
  // Clear queue when playing a standalone song
  queue.value = [];
  queueContext.value = '';

  if (currentSong.value?.id === song.id) {
    togglePlayPause();
    return;
  }
  _loadAndPlay(song);
}

/**
 * Play a list of songs in order. Optional startIndex and context label.
 * Auto-advances through the list when each preview ends.
 */
export function playQueue(songList, startIndex = 0, contextLabel = '') {
  const withPreview = songList.filter(s => s && s.preview_url);
  if (withPreview.length === 0) return;

  const startIdx = Math.min(Math.max(startIndex, 0), withPreview.length - 1);
  queue.value = withPreview.slice(startIdx + 1);
  queueContext.value = contextLabel;
  _loadAndPlay(withPreview[startIdx]);
}

/** Toggle play/pause on the current song. */
export function togglePlayPause() {
  const el = ensureAudio();
  if (!currentSong.value) return;
  if (el.paused) {
    el.play().catch(err => console.error('Play failed:', err));
  } else {
    el.pause();
  }
}

/** Stop playback and clear state. */
export function stopPlayback() {
  const el = ensureAudio();
  el.pause();
  el.currentTime = 0;
  currentSong.value  = null;
  isPlaying.value    = false;
  currentTime.value  = 0;
  totalTime.value    = 0;
  queue.value        = [];
  queueContext.value = '';
}

/** Seek to a given time (seconds). */
export function seek(time) {
  const el = ensureAudio();
  if (!currentSong.value) return;
  const clamped = Math.max(0, Math.min(time, totalTime.value || 30));
  el.currentTime = clamped;
  currentTime.value = clamped;
}

// ── Computed ──────────────────────────────────────────────────────────────────
export const progressPercent = computed(() => {
  if (!totalTime.value) return 0;
  return (currentTime.value / totalTime.value) * 100;
});

/** True if the given song is currently loaded (may or may not be playing). */
export function isCurrentSong(songOrId) {
  if (!currentSong.value) return false;
  const id = typeof songOrId === 'string' ? songOrId : songOrId?.id;
  return currentSong.value.id === id;
}

/** True if the given song is currently actively playing. */
export function isPlayingSong(songOrId) {
  return isCurrentSong(songOrId) && isPlaying.value;
}
