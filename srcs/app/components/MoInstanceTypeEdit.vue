<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプ編集"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm">
      <FormSection>
        <FormInput
          name="instance-type-name-edit"
          label="インスタンスタイプ名"
          type="text"
          :required="true"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          placeholder="例: standard.xlarge"
        />

        <FormInput
          name="instance-cpu-edit"
          label="vCPU数 (個)"
          type="number"
          :required="true"
          v-model.number="cpuCore"
          v-bind="cpuCoreAttrs"
          :error="errors.cpuCore"
          placeholder="例: 16"
          min="1"
        />

        <FormInput
          name="instance-memory-edit"
          label="メモリ (MB)"
          type="number"
          :required="true"
          v-model.number="memorySizeInMb"
          v-bind="memorySizeInMbAttrs"
          :error="errors.memorySizeInMb"
          placeholder="例: 32768"
          min="1"
        >
          <template #suffix>
            <span class="form-unit-label">MB</span>
          </template>
        </FormInput>
      </FormSection>

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isUpdating">
          {{ isUpdating ? "保存中..." : "保存" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * インスタンスタイプ編集モーダル (MoInstanceTypeEdit.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 汎用コンポーネント (FormInput, FormSection) を使用しています。
 * 実際のフォームの状態管理やAPI送信ロジックは `useInstanceTypeEditForm` Composable に
 * 分離されています。
 * =================================================================================
 */
import { useInstanceTypeEditForm } from "~/composables/modal/useInstanceTypeEditForm";
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types";

// ★ 汎用コンポーネントをインポート
import FormInput from "~/components/FormInput.vue";
import FormSection from "~/components/FormSection.vue";
// (FormSelect.vue はこのフォームでは使用しないためインポート不要)

// --- 親コンポーネントとの連携 (Props & Emits) ---
const props = defineProps({
  /** モーダルの表示状態 (trueで表示) */
  show: { type: Boolean, required: true },
  /** 編集対象の初期データ。呼び出し元(一覧ページなど)から渡される */
  instanceTypeData: {
    type: Object as PropType<ModelInstanceTypeDTO | null>,
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
  cpuCore,
  cpuCoreAttrs,
  memorySizeInMb,
  memorySizeInMbAttrs,
  // 状態とアクション
  isUpdating,
  onFormSubmit,
} = useInstanceTypeEditForm(props); // Composableにpropsを渡す

// --- イベントハンドラ ---
/** フォームの送信イベントを Composable に渡す */
const submitForm = onFormSubmit(emit);
</script>
