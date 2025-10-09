<template>
  <div>
    <label v-if="label" :for="name" class="form-label">{{ label }}</label>
    <textarea
      :id="name"
      v-model="model"
      v-bind="attrs || {}"
      class="form-input"
      :class="{ 'form-border-error': error }"
      :rows="rows"
    ></textarea>
    <p v-if="error" class="text-error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  name: string;
  error?: string;
  rows?: number;
}>();

const model = defineModel<string | null | undefined>();
const attrs = defineModel("attrs");
</script>
