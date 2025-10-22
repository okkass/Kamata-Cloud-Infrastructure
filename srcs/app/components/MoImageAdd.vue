<template>
  <BaseModal :show="show" title="イメージ追加" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="image-name-add" class="form-label">
          イメージ名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="image-name-add"
          type="text"
          placeholder="例: ubuntu-24.04-amd64"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="image-file-add" class="form-label">
          イメージファイル <span class="required-asterisk">*</span>
        </label>
        <FormDropZone
          id="image-file-add"
          v-model="file"
          accept=".img,.qcow2,.zip,.gz,.xz"
          :error-message="errors.file"
        />
      </div>

      <div>
        <label for="image-description-add" class="form-label">説明</label>
        <textarea
          id="image-description-add"
          :rows="3"
          v-model="description"
          v-bind="descriptionAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.description }"
          placeholder="例: Ubuntu 24.04 LTS (Noble Numbat) 64bit版"
        ></textarea>
        <p v-if="errors.description" class="text-error mt-1">
          {{ errors.description }}
        </p>
      </div>

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "追加中..." : "追加" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * イメージ追加モーダル (MoImageAdd.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理やAPI送信ロジックは `useImageAddForm` Composable に
 * 分離されています。
 * =================================================================================
 */
// Composable をインポート (パスはプロジェクトに合わせて調整してください)
import { useImageAddForm } from "~/composables/modal/useImageAddForm";
// FormDropZoneコンポーネントをインポート (パスを確認)
import FormDropZone from "~/components/FormDropZone.vue"; // パスを確認・調整してください

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors, // エラーオブジェクト
  // フォームフィールド
  name,
  nameAttrs,
  file, // FormDropZoneのv-model用
  // fileAttrs, // FormDropZoneでは通常不要
  description,
  descriptionAttrs,
  // 状態とアクション
  isCreating,
  onFormSubmit, // Composable が提供する送信ハンドラ
} = useImageAddForm();

// --- イベントハンドラ ---
// Composable から受け取った `onFormSubmit` 関数に、
// このコンポーネントの `emit` 関数を渡して実行するラッパー関数。
const submitForm = onFormSubmit(emit);
</script>
