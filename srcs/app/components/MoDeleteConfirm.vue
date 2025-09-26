<template>
  <BaseModal :show="show" :title="title" @close="$emit('close')">
    <div class="space-y-6">
      <p class="text-gray-700">
        {{ message }}
      </p>

      <div class="flex justify-end items-center gap-4 pt-4 border-t">
        <button @click="$emit('close')" class="btn-secondary">
          {{ cancelText }}
        </button>
        <button @click="onConfirm" class="btn-danger">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
// ==============================================================================
// Props (親から渡されるデータ)
// ==============================================================================
defineProps({
  // 表示/非表示を制御 (useModalのactiveModalと連携)
  show: {
    type: Boolean,
    required: true,
  },
  // モーダルのタイトル
  title: {
    type: String,
    default: "削除の確認",
  },
  // 表示する確認メッセージ
  message: {
    type: String,
    default: "この操作は取り消せません。本当に削除しますか？",
  },
  // 削除ボタンのテキスト
  confirmText: {
    type: String,
    default: "削除",
  },
  // キャンセルボタンのテキスト
  cancelText: {
    type: String,
    default: "キャンセル",
  },
});

const emit = defineEmits(["close", "confirm"]);

const onConfirm = () => {
  emit("confirm");
};
</script>

<style scoped>
.btn-secondary {
  @apply py-2 px-5 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300;
}
.btn-danger {
  @apply py-2 px-5 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700;
}
</style>
