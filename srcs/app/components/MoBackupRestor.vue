<template>
  <div>
    <BaseModal
      :show="show"
      title="バックアップから復元"
      @close="$emit('close')"
    >
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

            <div class="text-gray-500">作成日時</div>
            <div class="col-span-2">
              {{ formatDate(backupData?.createdAt) }}
            </div>

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
            @click="openConfirm"
            class="btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
            :disabled="isRestoring || !backupData?.id"
          >
            復元を実行
          </button>
        </div>
      </template>
    </BaseModal>

    <ConfirmationModal
      :show="showConfirm"
      title="復元の最終確認"
      message="現在の仮想マシンの状態はこのバックアップの内容で上書きされ、元に戻すことはできません。よろしいですか？"
      confirm-text="復元する"
      @confirm="onConfirmed"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBackupRestore } from "~/composables/modal/useBackupRestore";
import ConfirmationModal from "~/components/ConfirmationModal.vue";

// Props & Emits
const props = defineProps({
  show: { type: Boolean, required: true },
  backupData: { type: Object as PropType<any>, default: null },
});

const emit = defineEmits(["close", "success"]);

// Composable
const { isRestoring, executeRestoreApi } = useBackupRestore();

// ポップアップ制御
const showConfirm = ref(false);

const openConfirm = () => {
  showConfirm.value = true;
};

const onConfirmed = async () => {
  showConfirm.value = false;
  if (!props.backupData?.id) return;

  const success = await executeRestoreApi(
    props.backupData.id,
    props.backupData.name
  );

  if (success) {
    emit("success");
    emit("close");
  }
};

// --- ヘルパー関数 ---

// 日時フォーマット
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// メモリサイズフォーマット (Byte -> GB/MB)
const formatMemory = (bytes: number | undefined) => {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }
  return `${Math.round(bytes / 1048576)} MB`;
};
</script>
