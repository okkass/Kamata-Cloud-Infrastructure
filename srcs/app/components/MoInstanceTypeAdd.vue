<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="instance-type-name" class="form-label">
          インスタンスタイプ名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-type-name"
          type="text"
          placeholder="例: standard.xlarge"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="instance-cpu-cores" class="form-label">
          CPUコア数 <span class="required-asterisk">*</span>
        </label>
        <input
          id="instance-cpu-cores"
          type="number"
          placeholder="例: 16"
          v-model.number="cpuCores"
          v-bind="cpuCoresAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.cpuCores }"
        />
        <p v-if="errors.cpuCores" class="text-error mt-1">
          {{ errors.cpuCores }}
        </p>
      </div>

      <div>
        <label for="instance-memory" class="form-label">
          メモリサイズ <span class="required-asterisk">*</span>
        </label>
        <div class="flex">
          <input
            id="instance-memory"
            type="number"
            placeholder="例: 32768"
            v-model.number="memorySizeInMb"
            v-bind="memorySizeInMbAttrs"
            class="form-input rounded-r-none"
            :class="{ 'form-border-error': errors.memorySizeInMb }"
          />
          <span class="form-unit-label">MB</span>
        </div>
        <p v-if="errors.memorySizeInMb" class="text-error mt-1">
          {{ errors.memorySizeInMb }}
        </p>
      </div>
    </form>
    <template #footer>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "追加中..." : "追加" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * インスタンスタイプ追加モーダル (MoInstanceTypeAdd.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理やAPI送信ロジックは `useInstanceTypeAddForm` Composable に
 * 分離されています。
 * =================================================================================
 */
// Composable をインポート (パスはプロジェクトに合わせて調整してください)
import { useInstanceTypeAddForm } from "~/composables/modal/useInstanceTypeAddForm";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  name,
  nameAttrs,
  cpuCores,
  cpuCoresAttrs,
  memorySizeInMb,
  memorySizeInMbAttrs,
  isCreating,
  onFormSubmit, // Composable が提供する送信ハンドラ
} = useInstanceTypeAddForm();

// --- イベントハンドラ ---
// Composable から受け取った `onFormSubmit` 関数に、
// このコンポーネントの `emit` 関数を渡して実行するラッパー関数。
const submitForm = onFormSubmit(emit);
</script>
