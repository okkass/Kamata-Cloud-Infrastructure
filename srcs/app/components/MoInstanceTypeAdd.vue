<template>
  <BaseModal :show="show" title="インスタンスタイプの追加" @close="handleClose">
    <form
      id="instance-type-add-form"
      @submit.prevent="handleSubmit"
      class="modal-space"
    >
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
        v-model.number="cpuCore"
        v-bind="cpuCoreAttrs"
        :error="errors.cpuCore"
        :required="true"
      />

      <FormInput
        label="メモリサイズ"
        name="instance-memory"
        type="number"
        placeholder="例: 4096"
        v-model.number="memorySize"
        v-bind="memorySizeAttrs"
        :error="errors.memorySize"
        :required="true"
      >
        <template #suffix>
          <span class="form-unit-label rounded-l-none -ml-px">MB</span>
        </template>
      </FormInput>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="インスタンスタイプを追加"
          type="submit"
          form="instance-type-add-form"
        />
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

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  name,
  cpuCore,
  memorySize,
  nameAttrs,
  cpuCoreAttrs,
  memorySizeAttrs,
  // 状態とアクション
  isCreating,
  isValid,
  onFormSubmit,
  makeHandleClose,
} = useInstanceTypeAddForm();
const handleSubmit = onFormSubmit(emit);
const handleClose =  makeHandleClose(emit);
</script>
