<template>
  <button
    class="button is-small is-danger is-light icon-btn"
    :title="title"
    @click="$emit('click')"
  >
    <SvgIcon name="trash" :size="13" />
  </button>
</template>

<script setup>
import SvgIcon from './SvgIcon.vue';

defineProps({
  title: { type: String, default: 'Remove' },
});

defineEmits(['click']);
</script>
