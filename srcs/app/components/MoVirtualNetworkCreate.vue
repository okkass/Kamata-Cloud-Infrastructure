<template>
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="network-name-create" class="form-label">
          ネットワーク名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="network-name-create"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
          placeholder="例: vpc-frontend"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="ip-address-create" class="form-label">
          IPアドレス / CIDR <span class="required-asterisk">*</span>
        </label>
        <input
          id="ip-address-create"
          type="text"
          v-model="cidr"
          v-bind="cidrAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cidr }"
          placeholder="例: 192.168.0.0/16"
        />
        <p v-if="errors.cidr" class="text-error mt-1">{{ errors.cidr }}</p>
      </div>

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 仮想ネットワーク作成モーダル (MoVirtualNetworkCreate.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理やAPI送信ロジックは `useVirtualNetworkCreateForm` Composable に
 * 分離されています。
 * =================================================================================
 */
// Composable をインポート (パスはプロジェクトに合わせて調整してください)
import { useVirtualNetworkCreateForm } from "~/composables/modal/useVirtualNetworkCreateForm";

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors, // エラーオブジェクト
  name, // ネットワーク名の v-model 用
  nameAttrs, // ネットワーク名の v-bind 用
  cidr, // CIDRの v-model 用
  cidrAttrs, // CIDRの v-bind 用
  isCreating, // API通信中のローディング状態
  onFormSubmit, // Composable が提供する送信ハンドラ
} = useVirtualNetworkCreateForm();

// --- イベントハンドラ ---
// Composable から受け取った `onFormSubmit` 関数に、
// このコンポーネントの `emit` 関数を渡して実行するラッパー関数。
const submitForm = onFormSubmit(emit);
</script>
