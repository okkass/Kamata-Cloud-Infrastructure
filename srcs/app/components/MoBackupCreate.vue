<template>
  <BaseModal :show="show" title="バックアップ作成" @close="handleClose">
    <form
      id="backup-create-form"
      @submit.prevent="submitForm"
      class="modal-space"
    >
      <FormInput
        label="バックアップ名"
        name="backup-name"
        v-model="name"
        v-bind="nameAttrs"
        :error="errors.name"
        placeholder="例: backup-vm-01"
        required
      />

      <FormSelect
        label="対象の仮想マシン"
        name="target-virtual-machine"
        v-model="targetVirtualMachineId"
        v-bind="targetVirtualMachineIdAttrs"
        :options="vms ?? []"
        option-value="id"
        option-label="name"
        :pending="vmsPending"
        :error="!!vmsError"
        :error-message="errors.targetVirtualMachineId"
        required
      />

      <FormSelect
        label="対象のストレージ"
        name="target-storage"
        v-model="targetStorageId"
        v-bind="targetStorageIdAttrs"
        :options="availableStorages"
        option-value="id"
        option-label="name"
        :disabled="
          !targetVirtualMachineId || availableStorages.length === 0
        "
        :error-message="errors.targetStorageId"
        required
      >
        <template
          #help
          v-if="
            targetVirtualMachineId &&
            availableStorages.length === 0
          "
        >
          <p class="text-sm text-gray-500 mt-1">
            選択した仮想マシンにはバックアップ可能なストレージがありません。
          </p>
        </template>
      </FormSelect>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          form="backup-create-form"
          type="submit"
          label="バックアップを作成"
          :loading="isCreating"
          :disabled="!isValid"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useBackupCreateForm } from "~/composables/modal/useBackupCreateForm";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(["close", "success"]);

const {
  name,
  nameAttrs,
  targetVirtualMachineId,
  targetVirtualMachineIdAttrs,
  targetStorageId,
  targetStorageIdAttrs,
  errors,
  isValid,
  vms,
  vmsPending,
  vmsError,
  availableStorages,
  isCreating,
  onFormSubmit,
  resetForm,
} = useBackupCreateForm();
const submitForm = onFormSubmit(emit);

const handleClose = () => {
  resetForm();
  emit("close");
};
</script>
