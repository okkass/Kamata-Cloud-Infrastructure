<template>
  <div class="space-y-6">
    <div>
      <label for="template-select" class="form-label">テンプレート</label>
      <select
        id="template-select"
        v-model="selectedTemplate"
        class="form-input"
      >
        <option value="none">使用しない</option>
        <option value="web-small">Webサーバー (Small)</option>
        <option value="db-medium">DBサーバー (Medium)</option>
      </select>
    </div>

    <div v-if="selectedTemplate === 'none'" class="form-section space-y-4">
      <h3 class="section-title">CPU / メモリ</h3>
      <div>
        <label for="cpu-cores" class="form-label-sm">CPUコア数</label>
        <input
          type="number"
          id="cpu-cores"
          v-model="cpuCores"
          class="form-input"
        />
      </div>
      <div>
        <label for="memory-mb" class="form-label-sm">メモリ (MB)</label>
        <input
          type="number"
          id="memory-mb"
          v-model="memoryMb"
          class="form-input"
        />
      </div>
    </div>

    <div>
      <label for="backup-select" class="form-label">バックアップ</label>
      <select id="backup-select" v-model="selectedBackup" class="form-input">
        <option value="none">使用しない</option>
        <option v-for="backup in backups" :key="backup.id" :value="backup.id">
          {{ backup.name }} ({{ backup.size }}GB)
        </option>
      </select>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">ストレージ設定</h3>

      <div
        v-for="(storage, index) in storageList"
        :key="storage.id"
        class="storage-grid"
      >
        <div class="col-span-1 text-center text-gray-600 font-medium">
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
            v-model="storage.size"
            :disabled="storage.type === 'os' || storage.type === 'backup'"
            class="form-input"
          />
        </div>
        <div class="col-span-1 self-end pb-2">GB</div>

        <div class="col-span-4">
          <label class="input-label-xs">ストレージプール</label>
          <select v-model="storage.pool" class="form-input">
            <option>Pool-1</option>
            <option>Pool-2</option>
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

// テンプレート選択の状態
const selectedTemplate = ref("none");

// CPUとメモリの値
const cpuCores = ref(2);
const memoryMb = ref(2048);

// ダミーのバックアップデータ
const backups = ref([
  { id: "bk01", name: "daily-backup-web01", size: 30 },
  { id: "bk02", name: "weekly-backup-db01", size: 80 },
]);

// 選択されたバックアップの状態
const selectedBackup = ref("none");

// ストレージリストの状態
const storageList = ref([
  { id: 1, name: "OS", size: 20, pool: "Pool-1", type: "os" },
]);
let nextStorageId = 2;

// ストレージを手動で追加する関数
const addStorage = () => {
  storageList.value.push({
    id: nextStorageId++,
    name: "",
    size: 10,
    pool: "Pool-1",
    type: "manual",
  });
};

// selectedBackup の変更を監視する
watch(selectedBackup, (newBackupId) => {
  storageList.value = storageList.value.filter(
    (item) => item.type !== "backup"
  );
  if (newBackupId !== "none") {
    const backupData = backups.value.find((b) => b.id === newBackupId);
    if (backupData) {
      storageList.value.push({
        id: nextStorageId++,
        name: `backup-${backupData.name}`,
        size: backupData.size,
        pool: "Pool-1",
        type: "backup",
      });
    }
  }
});
</script>

<style scoped>
/* フォームセクションの共通スタイル */
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}

/* ラベルの共通スタイル */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
}
.input-label-xs {
  @apply block text-xs text-gray-500 mb-1;
}

/* 入力欄（input, select）の共通スタイル */
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.form-input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

/* ストレージ設定のグリッドレイアウト */
.storage-grid {
  @apply grid grid-cols-12 gap-3 items-center mb-3;
}

/* ボタンのスタイル */
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
</style>
