<template>
  <BaseModal :show="show" title="ストレージプール編集" @close="handleClose">
    <form
      id="storage-edit-form"
      @submit.prevent="submitForm"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="プール名"
          name="storage-name-edit"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />

        <FormSelect
          label="ネットワークアクセス"
          name="storage-network-edit"
          :options="networkOptions"
          :required="true"
          :error-message="errors.hasNetworkAccess"
          v-model="hasNetworkAccess"
          v-bind="hasNetworkAccessAttrs"
        />
      </div>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="isSaving || !isValid"
          :loading="isSaving"
          label="ストレージプールを更新"
          form="storage-edit-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ストレージプール編集モーダル (MoStorageEdit.vue)
 * =================================================================================
 */
import { useStorageEditForm } from "~/composables/modal/useStorageEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  storageData: {
    type: Object as PropType<StoragePoolResponse | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  errors,
  name,
  nameAttrs,
  hasNetworkAccess,
  hasNetworkAccessAttrs,
  isDirty,
  isValid,
  isSaving,
  onFormSubmit,
  makehandleClose,
} = useStorageEditForm(props);

// --- 選択肢定数 ---
const networkOptions = [
  { id: "true", name: "許可 (True)" },
  { id: "false", name: "拒否 (False)" },
];

// --- Submit ---
const submitForm = onFormSubmit(emit);
const handleClose = makehandleClose(emit);
</script>
