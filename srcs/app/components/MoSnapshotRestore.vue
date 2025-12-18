<template>
  <div>
    <BaseModal
      :show="show"
      title="スナップショットから復元"
      @close="$emit('close')"
    >
      <div class="space-y-6">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。<br />
                復元を実行する前に、現在の状態のスナップショットを取得することをお勧めします。
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
              {{ snapshotData?.name || "-" }}
            </div>

            <div class="text-gray-500">作成日時</div>
            <div class="col-span-2">
              {{ formatDate(snapshotData?.createdAt) }}
            </div>

            <div class="text-gray-500">説明</div>
            <div class="col-span-2">
              {{ snapshotData?.description || "-" }}
            </div>

            <div class="text-gray-500">ID</div>
            <div class="col-span-2 text-xs text-gray-400 break-all">
              {{ snapshotData?.id || "-" }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer flex justify-end items-center w-full">
          <button
            type="button"
            @click="openConfirm"
            class="btn bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
            :disabled="isRestoring || !snapshotData?.id"
          >
            復元を実行
          </button>
        </div>
      </template>
    </BaseModal>

    <ConfirmationModal
      :show="showConfirm"
      title="復元の最終確認"
      message="現在の仮想マシンの状態はこのスナップショットの内容で上書きされ、元に戻すことはできません。よろしいですか？"
      confirm-text="復元する"
      @confirm="onConfirmed"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PropType } from "vue";
import { useSnapshotRestore } from "~/composables/modal/useSnapshotRestore";
import ConfirmationModal from "~/components/ConfirmationModal.vue";

// Props & Emits
const props = defineProps({
  show: { type: Boolean, required: true },
  snapshotData: {
    type: Object as PropType<SnapshotResponse | null>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

// Composable
const { isRestoring, executeRestoreApi } = useSnapshotRestore();

// ポップアップ制御
const showConfirm = ref(false);

const openConfirm = () => {
  showConfirm.value = true;
};

const onConfirmed = async () => {
  showConfirm.value = false;
  if (!props.snapshotData?.id) return;

  const success = await executeRestoreApi(
    props.snapshotData.id,
    props.snapshotData.name
  );

  if (success) {
    emit("success");
    emit("close");
  }
};

// --- ヘルパー関数 ---
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
</script>
