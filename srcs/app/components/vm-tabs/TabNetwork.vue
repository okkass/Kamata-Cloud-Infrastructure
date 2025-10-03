<template>
  <div class="space-y-4">
    <div>
      <label for="network-select" class="form-label">ネットワーク</label>
      <div v-if="networksPending" class="text-gray-500">
        ネットワーク一覧を読み込み中...
      </div>
      <div v-else-if="networksError" class="text-red-500">
        ネットワーク一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="network-select"
        v-model="networkId"
        v-bind="networkIdAttrs"
        class="form-input"
        :class="{ 'border-red-500': errors.networkId }"
      >
        <option :value="undefined" disabled>
          ネットワークを選択してください
        </option>
        <option
          v-for="network in networks"
          :key="network.id"
          :value="network.id"
        >
          {{ network.name }} ({{ network.cidr }})
        </option>
      </select>
      <p v-if="errors.networkId" class="text-red-500 text-sm mt-1">
        {{ errors.networkId }}
      </p>
    </div>

    <div>
      <label for="security-group-select" class="form-label"
        >セキュリティグループ</label
      >
      <div v-if="sgPending" class="text-gray-500">
        セキュリティグループ一覧を読み込み中...
      </div>
      <div v-else-if="sgError" class="text-red-500">
        セキュリティグループ一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="security-group-select"
        v-model="securityGroupId"
        v-bind="securityGroupIdAttrs"
        class="form-input"
      >
        <option :value="null">なし</option>
        <option v-for="sg in securityGroups" :key="sg.id" :value="sg.id">
          {{ sg.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="form-label">キーペア (公開鍵)</label>
      <div
        class="drop-zone"
        :class="{ 'is-dragging': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          class="hidden"
          accept=".pub"
        />
        <div class="text-center">
          <p class="text-gray-500">ここにファイルをドラッグ&ドロップ</p>
          <p class="text-gray-400 text-sm my-2">または</p>
          <button type="button" @click="openFilePicker" class="btn-secondary">
            ファイルを選択
          </button>
          <p v-if="keyPairFile" class="text-green-600 font-semibold mt-4">
            選択中のファイル: {{ keyPairFile.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// 型定義 (変更なし)
// ==============================================================================
interface ModelVirtualNetworkDTO {
  id: string;
  name: string;
  cidr: string;
}
interface ModelSecurityGroupDTO {
  id: string;
  name: string;
}

// ==============================================================================
// バリデーションスキーマ
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    networkId: z.string({ required_error: "ネットワークを選択してください。" }),
    securityGroupId: z.string().nullable(),
    // Fileオブジェクトは zod の any() で許容します (必須ではないため)
    keyPairFile: z.any().nullable(),
  })
);

// ==============================================================================
// フォーム設定
// ==============================================================================
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    networkId: undefined,
    securityGroupId: null,
    keyPairFile: null,
  },
});

const [networkId, networkIdAttrs] = defineField("networkId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
// keyPairFile は手動で値をセットするため、v-bind用の属性は使いません
const [keyPairFile] = defineField("keyPairFile");

// --- 親コンポーネントへの公開 ---
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API連携 (変更なし)
// ==============================================================================
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<ModelVirtualNetworkDTO>("virtual-network");

const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<ModelSecurityGroupDTO>("security-group");

// ==============================================================================
// UI操作のロジック
// ==============================================================================
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  // VeeValidateの値を更新
  setFieldValue("keyPairFile", file);
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0] || null;
  // VeeValidateの値を更新
  setFieldValue("keyPairFile", file);
};
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.drop-zone {
  @apply w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-colors;
}
.drop-zone.is-dragging {
  @apply border-blue-500 bg-blue-50;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
</style>
