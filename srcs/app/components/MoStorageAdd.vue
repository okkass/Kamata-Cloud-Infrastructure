<template>
  <BaseModal :show="show" title="ストレージプール追加" @close="$emit('close')">
    <form @submit.prevent="submitForm">
      <FormSection>
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
        />
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
 * ストレージプール追加モーダル (MoStorageAdd.vue)
 * =================================================================================
 */
import { useStorageAddForm } from "~/composables/modal/useStorageAddForm";
import FormInput from "~/components/Form/Input.vue";
import FormSelect from "~/components/Form/Select.vue";
import FormSection from "~/components/Form/Section.vue";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からロジックを取得 ---
const {
  errors,
  name,
  nameAttrs,
  nodeId,
  devicePath,
  hasNetworkAccess,
  nodes,
  nodesPending,
  nodesError,
  deviceOptions,
  devicesPending,
  devicesError, // deviceOptionsを使用

  isCreating,
  onFormSubmit,
} = useStorageAddForm();

// --- 定数 ---
// Selectコンポーネントが要求する { id, name } 形式にする
// id は文字列にする必要があります
const networkOptions = [
  { id: "true", name: "許可 (True)" },
  { id: "false", name: "拒否 (False)" },
];

// --- イベントハンドラ ---
const submitHandler = onFormSubmit(emit);
const submitForm = () => {
  submitHandler();
};
</script>
