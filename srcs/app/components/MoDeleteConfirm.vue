<template>
  <BaseModal :show="show" :title="title" @close="$emit('close')">
    <div class="space-y-6">
      <p class="text-gray-700">
        {{ message }}
      </p>

      <div class="flex justify-end items-center gap-4 pt-4 border-t">
        <button @click="$emit('close')" class="btn btn-back">
          {{ cancelText }}
        </button>
        <button @click="onConfirm" class="btn btn-danger" :disabled="isLoading">
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
  // 削除処理中かどうか (ボタンの無効化に使用)
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "confirm"]);

const onConfirm = () => {
  emit("confirm");
};
</script>