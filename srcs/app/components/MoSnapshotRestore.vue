<template>
  <div>
    <BaseModal
      :show="show"
      title="スナップショットから復元"
      @close="$emit('close')"
    >
      <div class="space-y-6">
        <UiBaseAlert type="warning">
          この操作を行うと、現在の仮想マシンのデータは完全に上書きされます。<br />
          復元を実行する前に、現在の状態のスナップショットを取得することをお勧めします。
        </UiBaseAlert>

        <div class="border rounded-md bg-white overflow-hidden">
          <div class="bg-gray-50 px-4 py-2 border-b">
            <h4 class="font-bold text-sm text-gray-700">復元対象データ</h4>
          </div>

          <div
            class="p-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 text-sm"
          >
            <div>
              <span class="block text-xs text-gray-500 mb-1">名前</span>
              <span class="font-medium text-gray-900">{{
                snapshotData?.name || "-"
              }}</span>
            </div>

            <div>
              <span class="block text-xs text-gray-500 mb-1">作成日時</span>
              <span class="text-gray-900">{{
                formatDateTime(snapshotData?.createdAt)
              }}</span>
            </div>

            <div class="sm:col-span-2">
              <span class="block text-xs text-gray-500 mb-1">説明</span>
              <span class="text-gray-900">{{
                snapshotData?.description || "-"
              }}</span>
            </div>

            <div class="sm:col-span-2">
              <span class="block text-xs text-gray-500 mb-1">ID</span>
              <span class="text-xs text-gray-400 font-mono break-all">{{
                snapshotData?.id || "-"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer flex justify-end gap-2">
          <button
            type="button"
            @click="openConfirm"
            class="btn btn-danger"
            :disabled="isRestoring || !snapshotData?.id"
          >
            {{ isRestoring ? "復元中..." : "復元を実行" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <ConfirmationModal
      :show="showConfirm"
      title="復元の最終確認"
      message="現在の仮想マシンの状態はこのスナップショットの内容で上書きされ、元に戻すことはできません。よろしいですか？"
      confirm-text="復元する"
      confirm-button-class="btn-danger"
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
</script>
