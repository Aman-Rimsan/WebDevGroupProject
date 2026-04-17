<template>
  <div class="box playlist-card" @click="$router.push(`/playlists/${playlist.id}`)">
    <div class="is-flex is-justify-content-space-between is-align-items-flex-start">
      <div class="playlist-card-icon">
        <SvgIcon name="playlist" :size="22" />
      </div>
      <span class="tag is-light" style="background:var(--surface-2);color:var(--muted);border:1px solid var(--border);">
        {{ playlist.songIds.length }} {{ playlist.songIds.length === 1 ? 'song' : 'songs' }}
      </span>
    </div>
    <p class="playlist-card-name mt-3">{{ playlist.name }}</p>
    <p class="is-size-7 mt-1" style="color:var(--muted);">
      {{ duration }} · Created {{ formattedDate }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import SvgIcon from './SvgIcon.vue';
import { totalDuration } from '../utils/duration.js';

const props = defineProps({
  playlist: { type: Object, required: true },
  // Full song catalog so we can compute duration
  songs:    { type: Array,  default: () => [] },
});

useRouter(); // needed for template $router access

const playlistSongs = computed(() =>
  props.playlist.songIds
    .map(id => props.songs.find(s => String(s.id) === String(id)))
    .filter(Boolean)
);

const duration = computed(() => totalDuration(playlistSongs.value));

const formattedDate = computed(() => {
  if (!props.playlist.createdAt) return '';
  return new Date(props.playlist.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
});
</script>

<style scoped>
.playlist-card {
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.playlist-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}
.playlist-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.playlist-card-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
