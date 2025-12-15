<template>
  <BaseModal :show="show" title="スナップショット作成" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="space-y-4">
        <FormInput
          label="スナップショット名"
          name="snapshot-name"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
          placeholder="例: backup-before-update"
        />

        <FormSelect
          label="対象仮想マシン"
          name="snapshot-vm"
          :options="virtualMachines ?? []"
          option-label="name"
          option-value="id"
          placeholder="仮想マシンを選択してください"
          :required="true"
          :pending="vmsPending"
          :error="vmsError"
          :error-message="errors.vmId"
          v-model="vmId"
        />

        <FormTextarea
          label="説明"
          name="snapshot-description"
          :rows="3"
          v-model="description"
          v-bind="descriptionAttrs"
          :error="errors.description"
          placeholder="スナップショットの説明を入力してください"
        />
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isCreating"
        >
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * スナップショット作成モーダル (MoSnapshotCreate.vue)
 * =================================================================================
 */
import { useSnapshotCreateForm } from "~/composables/modal/useSnapshotCreateForm";
// 指定された共通コンポーネントを使用
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";
import FormSelect from "~/components/Form/Select.vue";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  errors,
  name,
  nameAttrs,
  vmId,
  // vmAttrs, // Selectコンポーネントの仕様により attrs が不要な場合は省略可
  description,
  descriptionAttrs,

  virtualMachines,
  vmsPending,
  vmsError,

  isCreating,
  onFormSubmit,
} = useSnapshotCreateForm();

// --- Event Handler ---
const submitHandler = onFormSubmit(emit);
const submitForm = () => {
  submitHandler();
};
</script>
