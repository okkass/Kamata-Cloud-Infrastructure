<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプ編集"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="instance-type-name-edit" class="form-label">
          インスタンスタイプ名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-type-name-edit"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
          placeholder="例: standard.xlarge"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="instance-cpu-edit" class="form-label">
          vCPU数 (個) <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-cpu-edit"
          type="number"
          v-model.number="cpuCore"
          v-bind="cpuCoreAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cpuCore }"
          placeholder="例: 16"
        />
        <p v-if="errors.cpuCore" class="text-error mt-1">
          {{ errors.cpuCore }}
        </p>
      </div>

      <div>
        <label for="instance-memory-edit" class="form-label">
          メモリ (MB) <span class="required-asterisk">*</span>
        </label>
        <div class="flex">
          <input
            id="instance-memory-edit"
            type="number"
            v-model.number="memorySizeInMb"
            v-bind="memorySizeInMbAttrs"
            class="form-input rounded-r-none"
            :class="{ 'form-border-error': errors.memorySizeInMb }"
            placeholder="例: 32768"
          />
          <span class="form-unit-label">MB</span>
        </div>
        <p v-if="errors.memorySizeInMb" class="text-error mt-1">
          {{ errors.memorySizeInMb }}
        </p>
      </div>

      <div class="modal-footer">
        <button type_="submit" class="btn btn-primary" :disabled="isUpdating">
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
 * 実際のフォームの状態管理やAPI送信ロジックは `useInstanceTypeEditForm` Composable に
 * 分離されています。
 * =================================================================================
 */
import { useInstanceTypeEditForm } from "~/composables/modal/useInstanceTypeEditForm";
import type { ModelInstanceTypeDTO } from "~~/shared/types/instance-types";

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
const submitForm = onFormSubmit(emit);
</script>
