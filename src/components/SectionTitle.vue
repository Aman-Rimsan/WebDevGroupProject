<template>
  <div class="section-title">
    <SvgIcon v-if="icon" :name="icon" :size="16" class="section-title-icon" />
    <slot />
  </div>
</template>

<script setup>
import SvgIcon from './SvgIcon.vue';

defineProps({
  icon: { default: '' },
});
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.section-title-icon {
  flex-shrink: 0;
  color: var(--accent);
  opacity: 0.85;
}
</style>
