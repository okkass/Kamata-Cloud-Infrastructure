<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm">
      <FormSection>
        <FormInput
          label="インスタンスタイプ名"
          name="instance-type-name"
          type="text"
          placeholder="例: standard.xlarge"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />

        <FormInput
          label="CPUコア数"
          name="instance-cpu-cores"
          type="number"
          placeholder="例: 16"
          v-model.number="cpuCores"
          v-bind="cpuCoresAttrs"
          :error="errors.cpuCores"
          :required="true"
        />

        <FormInput
          label="メモリサイズ"
          name="instance-memory"
          type="number"
          placeholder="例: 4096"
          v-model.number="memorySizeInMb"
          v-bind="memorySizeInMbAttrs"
          :error="errors.memorySizeInMb"
          :required="true"
        >
          <template #suffix>
            <span class="form-unit-label rounded-l-none -ml-px">MB</span>
          </template>
        </FormInput>
      </FormSection>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isCreating"
        >
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
 * =================================================================================
 */
import { useInstanceTypeAddForm } from "~/composables/modal/useInstanceTypeAddForm";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  // フォームフィールド (v-model用)
  name,
  cpuCores,
  memorySizeInMb,
  // 属性 (onBlur, onChange 用)
  nameAttrs,
  cpuCoresAttrs,
  memorySizeInMbAttrs,
  // 状態とアクション
  isCreating,
  onFormSubmit,
} = useInstanceTypeAddForm();

// --- イベントハンドラ ---

// ★★★ 修正箇所 ★★★
// onFormSubmit(emit) は Promise<void> を返す関数ですが、
// テンプレート側の型チェックで void を期待されるため、ここでラップします。
const submitHandler = onFormSubmit(emit);

const submitForm = () => {
  submitHandler();
};
</script>
