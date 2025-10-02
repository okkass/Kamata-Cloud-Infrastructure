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
        v-model="formData.networkId"
        class="form-input"
      >
        <option :value="null" disabled>ネットワークを選択してください</option>
        <option
          v-for="network in networks"
          :key="network.id"
          :value="network.id"
        >
          {{ network.name }} ({{ network.cidr }})
        </option>
      </select>
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
        v-model="formData.securityGroupId"
        class="form-input"
      >
        <option :value="null" disabled>
          セキュリティグループを選択してください
        </option>
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
          <button @click="openFilePicker" class="btn-secondary">
            ファイルを選択
          </button>
          <p
            v-if="formData.keyPairFile"
            class="text-green-600 font-semibold mt-4"
          >
            選択中のファイル: {{ formData.keyPairFile.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// ==============================================================================
// 型定義 (APIのレスポンスに合わせて更新)
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
// フォームの入力データ
// ==============================================================================
const formData = ref<{
  networkId: string | null;
  securityGroupId: string | null;
  keyPairFile: File | null;
}>({
  networkId: null,
  securityGroupId: null,
  keyPairFile: null,
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 (変更不要) ---
defineExpose({ formData });

// ==============================================================================
// API連携 (エンドポイントを修正)
// ==============================================================================
// --- ネットワーク一覧の取得 ---
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<ModelVirtualNetworkDTO>("virtual-network");

// --- セキュリティグループ一覧の取得 ---
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<ModelSecurityGroupDTO>("security-group");

// ==============================================================================
// UI操作のロジック (変更不要)
// ==============================================================================
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) formData.value.keyPairFile = file;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) formData.value.keyPairFile = file;
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
