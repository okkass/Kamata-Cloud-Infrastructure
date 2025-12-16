<template>
  <BaseModal :show="show" title="ストレージプール編集" @close="$emit('close')">
    <div v-if="!editedData" class="text-center py-8 text-gray-500">
      読み込み中...
    </div>

    <form v-else @submit.prevent="submitForm">
      <FormSection>
        <FormInput
          label="プール名"
          name="storage-name-edit"
          type="text"
          v-model="editedData.name"
          :error="errors.name"
          :required="true"
        />

        <FormInput
          label="物理ノード"
          name="storage-node-display"
          type="text"
          :model-value="editedData.nodeName || editedData.nodeId || '-'"
          :disabled="true"
          class="bg-gray-100 text-gray-500"
        />

        <FormInput
          label="デバイスパス"
          name="storage-device-display"
          type="text"
          :model-value="editedData.devicePath || '-'"
          :disabled="true"
          class="bg-gray-100 text-gray-500"
        />

        <FormSelect
          label="ネットワークアクセス"
          name="storage-network-edit"
          :options="networkOptions"
          :required="true"
          v-model="networkAccessString"
        />
      </FormSection>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isSaving || !isDirty"
        >
          {{ isSaving ? "保存中..." : "保存" }}
        </button>
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
import { computed } from "vue";
import { useStorageEditForm } from "~/composables/modal/useStorageEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import FormSection from "~/components/Form/Section.vue";

// --- Props & Emits ---
// storageData は any または StoragePoolResponse 型
const props = defineProps({
  show: { type: Boolean, required: true },
  storageData: { type: Object, default: null },
});
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const { editedData, errors, isDirty, isSaving, onFormSubmit } =
  useStorageEditForm(props);

// --- 選択肢定数 ---
const networkOptions = [
  { id: "true", name: "許可 (True)" },
  { id: "false", name: "拒否 (False)" },
];

// --- Boolean ⇔ String 変換ブリッジ ---
// FormSelect が string ID しか受け付けないため、ここで変換を噛ませる
const networkAccessString = computed({
  get: () => {
    return editedData.value?.hasNetworkAccess ? "true" : "false";
  },
  set: (val: string) => {
    if (editedData.value) {
      editedData.value.hasNetworkAccess = val === "true";
    }
  },
});

// --- Submit ---
const submitHandler = onFormSubmit(emit);
const submitForm = () => {
  submitHandler();
};
</script>
