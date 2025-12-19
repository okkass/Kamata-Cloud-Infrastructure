<template>
  <div
    class="relative inline-block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <Transition name="fade">
      <div
        v-if="disabled && isHovered"
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-50"
      >
        入力値が不足しています
        <div
          class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-600"
        ></div>
      </div>
    </Transition>

    <button
      :type="type"
      :form="form"
      class="btn btn-primary"
      :class="{ 'opacity-50 cursor-not-allowed': disabled || loading }"
      :disabled="disabled || loading"
    >
      <slot>{{ loading ? "処理中..." : label }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    form?: string;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    type: "button",
  }
);

const isHovered = ref(false);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
