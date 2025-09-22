<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    <TransitionGroup
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-x-[30px]"
      leave-active-class="transition-all duration-500 ease-in"
      leave-to-class="opacity-0 translate-x-[30px]"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="w-96 rounded-lg p-3 text-white shadow-lg overflow-hidden break-words"
        :class="toastColors[toast.type || 'info']"
      >
        <p class="font-bold">{{ toast.message }}</p>
        <p
          v-if="toast.details"
          class="mt-1 border-t border-white/30 pt-1 text-sm opacity-90"
        >
          {{ toast.details }}
        </p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast();

const toastColors = {
  info: "bg-blue-500",
  success: "bg-green-500",
  error: "bg-red-500",
};
</script>
