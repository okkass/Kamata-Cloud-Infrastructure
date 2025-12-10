<template>
  <div>
    <BaseModal
      :show="show"
      title="バックアップから復元"
      @close="$emit('close')"
    >
      <div class="space-y-6">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p class="text-sm text-yellow-700 font-medium">復元対象データ</p>
          <div class="mt-2 text-xs text-yellow-800">
            名前: {{ backupData?.name }}<br />
            サイズ: {{ backupData?.size }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <button
            type="button"
            @click="openConfirm"
            class="btn bg-red-600 text-white"
            :disabled="isRestoring"
          >
            復元を実行
          </button>
        </div>
      </template>
    </BaseModal>

    <MoConfirmationModal
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
import MoConfirmationModal from "~/components/MoConfirmationModal.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  backupData: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);
const { isRestoring, executeRestoreApi } = useBackupRestore();

// ポップアップ制御State
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
</script>
