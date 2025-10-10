<template>
  <div>
    <label v-if="label" :for="name" class="form-label"
      >{{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <textarea
      :id="name"
      v-model="model"
      v-bind=allAttrs
      class="form-input"
      :class="[$attrs.class, { 'form-border-error': error }]"
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
  required?: boolean;
}>();

const model = defineModel<string | null | undefined>();
const validationAttrs = defineModel("attrs");

const allAttrs = computed(() => ({
  ...(validationAttrs.value || {}), // vee-validateの属性
  ...useAttrs(), // step, placeholderなどの汎用属性
}));
</script>
