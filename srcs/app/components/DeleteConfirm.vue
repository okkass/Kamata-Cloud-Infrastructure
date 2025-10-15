<template>
  <BaseModal :show="show" title="確認" @close="$emit('close')" size="sm">
    <div class="space-y-6 text-center">
      <p class="text-base text-gray-700">
        {{ message }}
      </p>

      <div class="flex justify-center gap-4">
        <button @click="$emit('close')" class="btn btn-back">キャンセル</button>
        <button
          @click="$emit('confirm')"
          class="btn btn-danger"
          :disabled="isLoading"
        >
          {{ isLoading ? "削除中..." : "削除する" }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用削除確認モーダル (DeleteConfirm.vue)
 * ---------------------------------------------------------------------------------
 * 削除などの破壊的な操作の前に、ユーザーに最終確認を促すためのモーダルです。
 * 表示するメッセージやローディング状態をPropsとして受け取り、
 * ユーザーの選択結果（confirm / close）をイベントとして親に通知します。
 * =================================================================================
 */

// --- 親コンポーネントとの連携（Props & Emits） ---
defineProps({
  // モーダルの表示/非表示を制御
  show: { type: Boolean, required: true },
  // モーダル内に表示する確認メッセージ
  message: { type: String, required: true },
  // 削除処理中のローディング状態
  isLoading: { type: Boolean, default: false },
});

// 親コンポーネントに通知するイベントを定義
defineEmits(["close", "confirm"]);
</script>
