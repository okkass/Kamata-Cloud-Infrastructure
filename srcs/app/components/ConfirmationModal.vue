<template>
  <BaseModal :show="show" :title="title" @close="$emit('cancel')" size="sm">
    <div class="p-1 space-y-4">
      <div class="flex items-start gap-3">
        <div class="text-yellow-500 mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {{ message }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer flex gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          キャンセル
        </button>
        <button
          type="button"
          class="btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: "実行の確認" },
  message: { type: String, required: true },
  confirmText: { type: String, default: "実行" },
});

defineEmits(["confirm", "cancel"]);
</script>
