<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプ編集"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm">
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
 * インスタンスタイプ編集モーダル (MoInstanceTypeEdit.vue)
 * =================================================================================
 */
import { useInstanceTypeEditForm } from "~/composables/modal/useInstanceTypeEditForm";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  instanceTypeData: {
    type: Object as PropType<InstanceTypeDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  name,
  nameAttrs,
  cpuCore,
  cpuCoreAttrs,
  memorySizeInMb,
  memorySizeInMbAttrs,
  isUpdating,
  onFormSubmit,
} = useInstanceTypeEditForm(props);

// --- イベントハンドラ ---
const submitForm = onFormSubmit(emit);
</script>
