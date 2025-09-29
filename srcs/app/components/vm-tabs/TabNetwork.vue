<template>
  <div class="space-y-4">
    <div>
      <label for="network-select" class="form-label">ネットワーク</label>
      <select
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
      <select
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

<script setup>
import { ref } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// このコンポーネントは、ネットワークとセキュリティ情報を入力するためのフォームです。
// APIから「ネットワーク一覧」「セキュリティグループ一覧」を取得し、
// `networks`, `securityGroups` のrefを更新する処理を実装してください。
// ==============================================================================

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const formData = ref({
  networkId: null,
  securityGroupId: null,
  keyPairFile: null, // 選択されたファイルオブジェクトを保持
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 ---
defineExpose({
  formData,
});

// ============================================================================
// ▼▼▼ API実装担当者の方へ: ここにAPIから各種リストを取得する処理を実装してください ▼▼▼
// ============================================================================

// --- APIから取得するデータ（現在はダミー） ---
const networks = ref([
  { id: "net-1", name: "Public Network", cidr: "10.0.1.0/24" },
  { id: "net-2", name: "Private Network", cidr: "192.168.10.0/24" },
]);
const securityGroups = ref([
  { id: "sg-1", name: "default" },
  { id: "sg-2", name: "web-server-rules" },
]);

// onMounted(async () => {
//   // コンポーネント表示時にAPIからデータを取得
//   const { data: netData } = await useApiFetch('/networks');
//   networks.value = netData.value;
//
//   const { data: sgData } = await useApiFetch('/security-groups');
//   securityGroups.value = sgData.value;
// });

// ============================================================================
// ▲▲▲ API実装はここまで ▲▲▲
// ============================================================================

// --- UI操作のロジック (変更不要) ---
const fileInput = ref(null);
const isDragging = ref(false);

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    formData.value.keyPairFile = file;
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    formData.value.keyPairFile = file;
  }
};
</script>

<style scoped>
/* ラベルの共通スタイル */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
/* 入力欄（input, select）の共通スタイル */
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
/* ドラッグ&ドロップエリアのスタイル */
.drop-zone {
  @apply w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-colors;
}
.drop-zone.is-dragging {
  @apply border-blue-500 bg-blue-50;
}
/* ボタンのスタイル */
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
</style>
