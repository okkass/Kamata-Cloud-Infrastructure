<template>
  <div class="section-form">
    <h3 v-if="title" class="section-title mb-4">{{ title }}</h3>
    <div class="modal-space">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>