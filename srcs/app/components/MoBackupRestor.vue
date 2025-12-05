<template>
  <BaseModal :show="show" title="バックアップから復元" @close="$emit('close')">
    <div class="space-y-6">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。<br />
              復元を実行する前に、現在の状態のバックアップを取得することをお勧めします。
            </p>
          </div>
        </div>
      </div>

      <div class="border rounded-md p-4 bg-gray-50 space-y-3">
        <h4 class="font-bold text-gray-700 border-b pb-2 mb-2">
          復元対象データ
        </h4>

        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="text-gray-500">名前</div>
          <div class="col-span-2 font-medium">
            {{ backupData?.name || "-" }}
          </div>

          <div class="text-gray-500">サイズ</div>
          <div class="col-span-2">{{ formatSize(backupData?.size) }}</div>

          <div class="text-gray-500">作成日時</div>
          <div class="col-span-2">{{ formatDate(backupData?.createdAt) }}</div>

          <div class="text-gray-500">ID</div>
          <div class="col-span-2 text-xs text-gray-400 break-all">
            {{ backupData?.id || "-" }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer flex justify-between items-center w-full">
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-secondary"
          :disabled="isRestoring"
        >
          キャンセル
        </button>

        <button
          type="button"
          @click="handleRestore"
          class="btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
          :disabled="isRestoring || !backupData?.id"
        >
          {{ isRestoring ? "復元中..." : "復元を実行" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * バックアップ復元モーダル (MoBuckupRestor.vue)
 * =================================================================================
 */
import { useBackupRestore } from "~/composables/modal/useBackupRestore";

// --- Props & Emits ---
// backupData は型定義なし (any) で受け取ります
const props = defineProps({
  show: { type: Boolean, required: true },
  backupData: { type: Object as PropType<any>, default: null },
});

const emit = defineEmits(["close", "success"]);

// --- Composable ---
const { isRestoring, executeRestore } = useBackupRestore();

// --- Methods ---
const handleRestore = async () => {
  if (!props.backupData?.id) return;

  const success = await executeRestore(
    props.backupData.id,
    props.backupData.name
  );

  if (success) {
    emit("success");
    emit("close");
  }
};

// --- Format Helpers (簡易実装) ---
const formatSize = (bytes: number | undefined) => {
  if (bytes === undefined || bytes === null) return "-";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("ja-JP");
};
</script>
