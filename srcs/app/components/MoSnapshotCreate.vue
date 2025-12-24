<template>
  <BaseModal :show="show" title="スナップショット作成" @close="handleClose">
    <form
      id="snapshot-create-form"
      @submit.prevent="onSubmit"
      class="space-y-6"
    >
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
          :error-message="errors.targetVmId"
          v-model="targetVmId"
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
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="スナップショットを作成"
          form="snapshot-create-form"
          type="submit"
        />
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
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";
import FormSelect from "~/components/Form/Select.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  errors,
  name,
  nameAttrs,
  targetVmId,
  description,
  descriptionAttrs,
  virtualMachines,
  vmsPending,
  vmsError,
  isCreating,
  isValid,
  onFormSubmit,
  makehandleClose,
} = useSnapshotCreateForm(emit);
const handleClose = makehandleClose(emit);
const onSubmit = onFormSubmit(emit);
</script>
