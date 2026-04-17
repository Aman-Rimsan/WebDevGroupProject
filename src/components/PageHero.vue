<template>
  <section class="page-hero">
    <div>
      <p class="page-kicker">{{ kicker }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup>
defineProps({
  kicker: { required: true },
  title: { required: true },
  subtitle: { default: '' },
});
</script>
