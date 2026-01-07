<template>
  <BaseModal :show="show" title="ストレージプール追加" @close="handleClose">
    <form
      id="storage-add-form"
      @submit.prevent="submitForm"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="プール名"
          name="storage-name"
          type="text"
          placeholder="例: local-storage-pool"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />

        <FormSelect
          label="物理ノード"
          name="storage-node"
          :options="nodes ?? []"
          option-label="name"
          option-value="id"
          placeholder="ノードを選択してください"
          :required="true"
          :pending="nodesPending"
          :error="nodesError"
          :error-message="errors.nodeId"
          v-model="nodeId"
          v-bind="nodeAttrs"
        />

        <FormSelect
          label="デバイスパス"
          name="storage-device"
          :options="deviceOptions"
          placeholder="デバイスを選択してください"
          :required="true"
          :pending="devicesPending"
          :error="devicesError"
          :error-message="errors.devicePath"
          :disabled="!nodeId"
          v-model="devicePath"
          v-bind="devicePathAttrs"
        />
        <p v-if="!nodeId" class="text-xs text-gray-500 mt-1">
          ※ 先に物理ノードを選択してください
        </p>
        <p
          v-else-if="deviceOptions.length === 0 && !devicesPending"
          class="text-xs text-orange-500 mt-1"
        >
          ※ 利用可能なデバイスが見つかりません
        </p>

        <FormSelect
          label="ネットワークアクセス"
          name="storage-network"
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
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="ストレージプールを追加"
          form="storage-add-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ストレージプール追加モーダル (MoStorageAdd.vue)
 * =================================================================================
 */
import { useStorageAddForm } from "~/composables/modal/useStorageAddForm";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import UiSubmitButton from "~/components/ui/SubmitButton.vue";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からロジックを取得 ---
const {
  errors,
  name,
  nameAttrs,
  nodeId,
  nodeAttrs,
  devicePath,
  devicePathAttrs,
  hasNetworkAccess,
  hasNetworkAccessAttrs,
  nodes,
  nodesPending,
  nodesError,
  deviceOptions,
  devicesPending,
  devicesError,
  isValid,
  isCreating,
  onFormSubmit,
  makehandleClose,
} = useStorageAddForm();

// --- 選択肢定数 ---
const networkOptions = [
  { id: "true", name: "許可 (True)" },
  { id: "false", name: "拒否 (False)" },
];

// --- Submit Handler ---
const submitForm = onFormSubmit(emit);
const handleClose = makehandleClose(emit);
</script>
