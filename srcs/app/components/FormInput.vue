<template>
  <div>
    <label v-if="label" :for="name" class="form-label-sm">{{ label }}</label>
    <div class="flex items-center gap-2">
      <input
        :id="name"
        :type="type"
        :placeholder="placeholder"
        v-model="model"
        v-bind="attrs || {}"
        class="form-input"
        :class="{ 'form-border-error': error }"
        :disabled="disabled"
      />
      <slot name="suffix" />
    </div>
    <p v-if="error" class="text-error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  name: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}>();

const model = defineModel();
const attrs = defineModel("attrs");
</script>
