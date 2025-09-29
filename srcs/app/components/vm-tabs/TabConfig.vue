<template>
  <div class="space-y-6">
    <div>
      <label for="template-select" class="form-label">テンプレート</label>
      <select
        id="template-select"
        v-model="formData.templateId"
        class="form-input"
      >
        <option :value="null">使用しない</option>
        <option
          v-for="template in templates"
          :key="template.id"
          :value="template.id"
        >
          {{ template.name }}
        </option>
      </select>
    </div>

    <div v-if="!formData.templateId" class="form-section space-y-4">
      <h3 class="section-title">CPU / メモリ</h3>
      <div>
        <label for="cpu-cores" class="form-label-sm">CPUコア数</label>
        <input
          type="number"
          id="cpu-cores"
          v-model.number="formData.cpuCores"
          class="form-input"
        />
      </div>
      <div>
        <label for="memory-gb" class="form-label-sm">メモリ (GB)</label>
        <input
          type="number"
          id="memory-gb"
          v-model.number="formData.memorySize"
          class="form-input"
        />
      </div>
    </div>

    <div>
      <label for="backup-select" class="form-label">バックアップ</label>
      <select id="backup-select" v-model="formData.backupId" class="form-input">
        <option :value="null">使用しない</option>
        <option v-for="backup in backups" :key="backup.id" :value="backup.id">
          {{ backup.name }} ({{ backup.size }}GB)
        </option>
      </select>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">ストレージ設定</h3>
      <div
        v-for="(storage, index) in formData.storages"
        :key="storage.id"
        class="storage-grid"
      >
        <div class="col-span-1 text-center text-gray-600 font-medium pt-6">
          {{ index + 1 }}.
        </div>
        <div class="col-span-4">
          <label class="input-label-xs">名前</label>
          <input
            type="text"
            v-model="storage.name"
            :placeholder="storage.type === 'os' ? 'OS' : '例: web-data'"
            :disabled="storage.type === 'os' || storage.type === 'backup'"
            class="form-input"
          />
        </div>
        <div class="col-span-2">
          <label class="input-label-xs">サイズ</label>
          <input
            type="number"
            v-model.number="storage.size"
            :disabled="storage.type === 'os' || storage.type === 'backup'"
            class="form-input"
          />
        </div>
        <div class="self-end pb-2">GB</div>
        <div class="col-span-4">
          <label class="input-label-xs">ストレージプール</label>
          <select v-model="storage.pool" class="form-input">
            <option
              v-for="pool in storagePools"
              :key="pool.id"
              :value="pool.id"
            >
              {{ pool.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <button @click="addStorage" class="btn-secondary">追加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// このコンポーネントは、VMの構成情報を入力するためのフォームです。
// APIから「テンプレート一覧」「バックアップ一覧」「ストレージプール一覧」を取得し、
// `templates`, `backups`, `storagePools` のrefを更新する処理を実装してください。
// ==============================================================================

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const formData = ref({
  templateId: null,
  cpuCores: 2,
  memorySize: 2, // UI上ではGB単位
  backupId: null,
  storages: [{ id: 1, name: "OS", size: 20, pool: "pool-1", type: "os" }],
});
let nextStorageId = 2; // 手動追加するストレージ用の一意なID

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 ---
defineExpose({
  formData,
});

// ============================================================================
// ▼▼▼ API実装担当者の方へ: ここにAPIから各種リストを取得する処理を実装してください ▼▼▼
// ============================================================================

// --- APIから取得するデータ（現在はダミー） ---
const templates = ref([
  { id: "web-small", name: "Webサーバー (Small)" },
  { id: "db-medium", name: "DBサーバー (Medium)" },
]);
const backups = ref([
  { id: "bk01", name: "daily-backup-web01", size: 30 },
  { id: "bk02", name: "weekly-backup-db01", size: 80 },
]);
const storagePools = ref([
  { id: "pool-1", name: "Pool-1" },
  { id: "pool-2", name: "Pool-2" },
]);

// onMounted(async () => {
//   // ページが読み込まれたら、APIからデータを取得
//   const { data: templateData } = await useApiFetch('/templates');
//   templates.value = templateData.value;
//
//   const { data: backupData } = await useApiFetch('/backups');
//   backups.value = backupData.value;
// });

// ============================================================================
// ▲▲▲ API実装はここまで ▲▲▲
// ============================================================================

// --- UI操作のロジック (変更不要) ---
const addStorage = () => {
  formData.value.storages.push({
    id: nextStorageId++,
    name: "",
    size: 10,
    pool: "pool-1",
    type: "manual",
  });
};

watch(
  () => formData.value.backupId,
  (newBackupId) => {
    formData.value.storages = formData.value.storages.filter(
      (item) => item.type !== "backup"
    );
    if (newBackupId) {
      const backupData = backups.value.find((b) => b.id === newBackupId);
      if (backupData) {
        formData.value.storages.push({
          id: `backup-${backupData.id}`,
          name: `backup-${backupData.name}`,
          size: backupData.size,
          pool: "pool-1",
          type: "backup",
        });
      }
    }
  }
);
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
}
.input-label-xs {
  @apply block text-xs text-gray-500 mb-1;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.form-input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
.storage-grid {
  @apply grid grid-cols-12 gap-3 items-center mb-3;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
</style>
