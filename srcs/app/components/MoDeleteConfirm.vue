<template>
  <BaseModal :show="show" title="確認" size="sm" @close="$emit('close')">
    <div class="space-y-6 text-center">
      <p class="text-base text-gray-700">
        {{ message }}
      </p>

      <div class="flex justify-center gap-4">
        <button type="button" class="btn btn-back" @click="$emit('close')">
          キャンセル
        </button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="isLoading"
          @click="$emit('confirm')"
        >
          <span v-if="isLoading">削除中...</span>
          <span v-else>削除する</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用削除確認モーダル (MoDeleteConfirm.vue)
 * ---------------------------------------------------------------------------------
 * 削除などの破壊的な操作の前に、ユーザーに最終確認を促すためのモーダルです。
 * BaseModalを土台として利用し、確認メッセージとアクションボタンの表示に特化しています。
 * =================================================================================
 */

// --- 親コンポーネントとの連携（Props & Emits） ---

defineProps({
  /** モーダルの表示/非表示を制御します */
  show: { type: Boolean, required: true },
  /** モーダル内に表示する確認メッセージです */
  message: { type: String, required: true },
  /** 削除処理中のローディング状態を示します */
  isLoading: { type: Boolean, default: false },
});

/** 親コンポーネントに通知するイベントを定義します（'close'はキャンセル、'confirm'は実行） */
defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>