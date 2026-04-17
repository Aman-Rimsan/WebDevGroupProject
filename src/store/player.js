import { ref, computed } from 'vue';

export const currentSong = ref(null);
export const isPlaying = ref(false);
export const currentTime = ref(0);
export const totalTime = ref(0);
export const queue = ref([]);
export const queueContext = ref('');

let audio = null;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';

  audio.addEventListener('timeupdate', () => { currentTime.value = audio.currentTime; });
  audio.addEventListener('loadedmetadata', () => { totalTime.value = audio.duration || 30; });
  audio.addEventListener('play', () => { isPlaying.value = true; });
  audio.addEventListener('pause', () => { isPlaying.value = false; });
  audio.addEventListener('error', () => { isPlaying.value = false; });

  audio.addEventListener('ended', () => {
    // Auto-play the next song in the queue, if there is one. Otherwise, stop playback.
    if (queue.value.length > 0) {
      loadAndPlay(queue.value.shift());
    } else {
      isPlaying.value = false;
      currentTime.value = 0;
    }
  });

  return audio;
}

function loadAndPlay(song) {
  const el = ensureAudio();
  currentSong.value = song;
  currentTime.value = 0;
  totalTime.value = 30;
  el.src = song.preview_url;
  el.play().catch(() => { isPlaying.value = false; });
}

// Play a song. If it's already loaded, toggle pause/resume instead.
export function playSong(song) {
  if (!song?.preview_url) return;
  queue.value = [];
  queueContext.value = '';
  if (currentSong.value?.id === song.id) {
    togglePlayPause();
    return;
  }
  loadAndPlay(song);
}

// Play an ordered list, auto-advancing when each preview ends.
export function playQueue(songList, startIndex = 0, contextLabel = '') {
  const withPreview = songList.filter(s => s?.preview_url);
  if (!withPreview.length) return;
  const idx = Math.min(Math.max(startIndex, 0), withPreview.length - 1);
  queue.value = withPreview.slice(idx + 1);
  queueContext.value = contextLabel;
  loadAndPlay(withPreview[idx]);
}

export function togglePlayPause() {
  const el = ensureAudio();
  if (!currentSong.value) return;
  el.paused ? el.play().catch(() => {}) : el.pause();
}

export function stopPlayback() {
  const el = ensureAudio();
  el.pause();
  el.currentTime = 0;
  currentSong.value = null;
  isPlaying.value = false;
  currentTime.value = 0;
  totalTime.value = 0;
  queue.value = [];
  queueContext.value = '';
}

export function seek(time) {
  const el = ensureAudio();
  if (!currentSong.value) return;
  el.currentTime = Math.max(0, Math.min(time, totalTime.value || 30));
  currentTime.value = el.currentTime;
}

export const progressPercent = computed(() =>
  totalTime.value ? (currentTime.value / totalTime.value) * 100 : 0
);

export function isCurrentSong(songOrId) {
  if (!currentSong.value) return false;
  const id = typeof songOrId === 'string' ? songOrId : songOrId?.id;
  return currentSong.value.id === id;
}

export function isPlayingSong(songOrId) {
  return isCurrentSong(songOrId) && isPlaying.value;
}
