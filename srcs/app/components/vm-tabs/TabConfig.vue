<template>
  <div class="space-y-6">
    <div>
      <label for="template-select" class="form-label">テンプレート</label>
      <div v-if="templatesPending" class="text-gray-500">
        テンプレート一覧を読み込み中...
      </div>
      <div v-else-if="templatesError" class="text-red-500">
        テンプレート一覧の取得に失敗しました。
      </div>
      <select
        v-else
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
          {{ template.name }} ({{ template.cpuCores }}コア,
          {{ template.memorySize / 1024 / 1024 / 1024 }}GB)
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
      <div v-if="backupsPending" class="text-gray-500">
        バックアップ一覧を読み込み中...
      </div>
      <div v-else-if="backupsError" class="text-red-500">
        バックアップ一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="backup-select"
        v-model="formData.backupId"
        class="form-input"
      >
        <option :value="null">使用しない</option>
        <option v-for="backup in backups" :key="backup.id" :value="backup.id">
          {{ backup.name }} ({{
            (backup.size / 1024 / 1024 / 1024).toFixed(1)
          }}GB)
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
            :disabled="storage.type !== 'manual'"
            class="form-input"
          />
        </div>
        <div class="col-span-2">
          <label class="input-label-xs">サイズ</label>
          <input
            type="number"
            v-model.number="storage.size"
            :disabled="storage.type !== 'manual'"
            class="form-input"
          />
        </div>
        <div class="self-end pb-2">GB</div>
        <div class="col-span-4">
          <label class="input-label-xs">ストレージプール</label>
          <div v-if="poolsPending" class="text-gray-500 text-sm">
            読み込み中...
          </div>
          <div v-else-if="poolsError" class="text-red-500 text-sm">
            取得失敗
          </div>
          <select v-else v-model="storage.poolId" class="form-input">
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

<script setup lang="ts">
import { ref, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// (型定義は変更なし)
interface ModelInstanceTypeDTO {
  id: string;
  name: string;
  cpuCores: number;
  memorySize: number;
  storageSize: number;
}
interface ModelBackupDTO {
  id: string;
  name: string;
  size: number;
}
interface ModelStoragePoolDTO {
  id: string;
  name: string;
}

// ==============================================================================
// フォームの入力データ
// ==============================================================================
const formData = ref({
  templateId: null,
  cpuCores: 2,
  memorySize: 2,
  backupId: null,
  storages: [
    { id: 1, name: "OS", size: 20, poolId: "pool-1", type: "os" as const },
  ],
});
let nextStorageId = 2;

// (defineExposeは変更なし)
defineExpose({ formData });

// ==============================================================================
// API連携
// ==============================================================================
const {
  data: templates,
  pending: templatesPending,
  error: templatesError,
} = useResourceList<ModelInstanceTypeDTO>("instance-type");

const {
  data: backups,
  pending: backupsPending,
  error: backupsError,
} = useResourceList<ModelBackupDTO>("backup");

const {
  data: storagePools,
  pending: poolsPending,
  error: poolsError,
} = useResourceList<ModelStoragePoolDTO>("storage-pool");

// ==============================================================================
// UI操作のロジック
// ==============================================================================
const addStorage = () => {
  formData.value.storages.push({
    id: nextStorageId++,
    name: "",
    size: 10,
    poolId: "pool-1",
    type: "manual" as const,
  });
};

// (バックアップ選択時のロジックは変更なし)
watch(
  () => formData.value.backupId,
  (newBackupId) => {
    formData.value.storages = formData.value.storages.filter(
      (item) => item.type !== "backup"
    );
    if (newBackupId && backups.value) {
      const backupData = backups.value.find((b) => b.id === newBackupId);
      if (backupData) {
        formData.value.storages.push({
          id: `backup-${backupData.id}`,
          name: `backup-${backupData.name}`,
          size: Math.round(backupData.size / 1024 / 1024 / 1024),
          poolId: "pool-1",
          type: "backup" as const,
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
