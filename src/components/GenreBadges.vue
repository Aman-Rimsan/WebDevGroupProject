<template>
  <div class="tags">
    <span
      v-for="item in items"
      :key="typeof item === 'string' ? item : item.label"
      class="tag is-light genre-tag"
    >
      {{ typeof item === 'string' ? item : item.label }}
      <template v-if="typeof item !== 'string' && item.count !== undefined">
        &nbsp;· {{ item.count }}
      </template>
    </span>
  </div>
</template>

<script setup>
// items: string[] | { label: string, count: number }[]
defineProps({
  items: { type: Array, required: true },
});
</script>

<style scoped>
.genre-tag {
  background: var(--surface-2) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  border-radius: 999px !important;
}
</style>
