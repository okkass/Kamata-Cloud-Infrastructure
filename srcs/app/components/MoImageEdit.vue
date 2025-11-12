<template>
  <BaseModal :show="show" title="イメージ編集" @close="$emit('close')">
    <form @submit.prevent="submitForm">
      <FormInput
        name="image-name-edit"
        label="イメージ名"
        type="text"
        :required="true"
        v-model="name"
        v-bind="nameAttrs"
        :error="errors.name"
        placeholder="例: ubuntu-22.04-custom"
      />

      <FormTextarea
        name="image-description-edit"
        label="説明"
        :rows="4"
        v-model="description"
        v-bind="descriptionAttrs"
        :error="errors.description"
        placeholder="イメージの説明を入力してください"
      />
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isUpdating"
        >
          {{ isUpdating ? "保存中..." : "保存" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * イメージ編集モーダル (MoImageEdit.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理やAPI送信ロジックは `useImageEditForm` Composable に
 * 分離されています。
 * =================================================================================
 */
import { useImageEditForm } from "~/composables/modal/useImageEditForm";
import type { ImageDTO } from "~~/shared/types/images";

// ★ 汎用コンポーネントをインポート
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";
import FormTextarea from "~/components/Form/Textarea.vue";

// --- 親コンポーネントとの連携 (Props & Emits) ---
const props = defineProps({
  /** モーダルの表示状態 (trueで表示) */
  show: { type: Boolean, required: true },
  /** 編集対象の初期データ。呼び出し元(一覧ページなど)から渡される */
  imageData: {
    type: Object as PropType<ImageDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  // フォームフィールド
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  // 状態とアクション
  isUpdating,
  onFormSubmit,
} = useImageEditForm(props); // Composableにpropsを渡す

// --- イベントハンドラ ---
/** フォームの送信イベントを Composable に渡す */
const submitForm = onFormSubmit(emit);
</script>
