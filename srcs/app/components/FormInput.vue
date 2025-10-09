<template>
  <div>
    <label v-if="label" :for="name" class="form-label-sm">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <div class="flex items-center">
      <input
        :id="name"
        :type="type"
        :placeholder="placeholder"
        v-model="model"
        v-bind="allAttrs"
        class="form-input rounded-r-none"
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
import { computed } from "vue";
defineOptions({ inheritAttrs: false });

defineProps<{
  label: string;
  name: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}>();

const model = defineModel();
const validationAttrs = defineModel("attrs");

const allAttrs = computed(() => ({
  ...(validationAttrs.value || {}), // vee-validateの属性
  ...useAttrs(), // step, placeholderなどの汎用属性
}));
</script>
