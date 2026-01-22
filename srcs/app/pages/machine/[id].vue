<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!vm && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <!-- vm が一度でも取得できたら、以降は常にこれ -->
    <ResourceDetailShell
      v-else-if="vm"
      title="仮想マシン詳細"
      subtitle="VM Information"
      :tabs="vmTabs"
      :context="vm!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoVirtualMachineEdit
      v-if="vm"
      :show="isEditOpen"
      :vm-data="vm"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />

    <!-- 確認ダイアログ -->
    <ConfirmationModal
      :show="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      @confirm="executeConfirmedAction"
      @cancel="closeConfirmDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { MACHINE } from "~/utils/constants";
import { createPolling } from "~/utils/polling";
import { useResourceErrorGuard } from "~/composables/useResourceErrorGuard";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import ConfirmationModal from "~/components/ConfirmationModal.vue";
import { vmTabs } from "~/composables/detail/useVmTabs";

import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "~/composables/useToast";
import { useApiClient } from "~/composables/useResourceClient";

const { addToast } = useToast();
const apiClient = useApiClient();

const route = useRoute();
const router = useRouter();

// VM 詳細取得
const {
  data: vm,
  pending,
  error,
  refresh,
} = await useResourceDetail<VirtualMachineResponse>(
  MACHINE.name,
  route.params.id as string,
);

// エラーをカスタムエラーページに統一
useResourceErrorGuard(vm, pending, error);

// --- ポーリング設定 ---
const polling = createPolling(async () => {
  try {
    await refresh();
  } catch (err) {
    console.error("Failed to refresh VM in polling", err);
  }
});

// lifecycle
onMounted(async () => {
  await polling.runOnce();
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー
const actions = ref([
  { label: "起動", value: "start" },
  { label: "停止", value: "stop" },
  { label: "シャットダウン", value: "shutdown" },
  { label: "再起動", value: "reboot" },
  { label: "リセット", value: "reset" },
  { label: "編集", value: "edit" },
]);

// API エンドポイント
const actionEndpointMap: Record<string, string> = {
  start: "start",
  stop: "stop",
  shutdown: "shutdown",
  reboot: "reboot",
  reset: "reset",
};

// 成功メッセージ
const actionSuccessMessage: Record<string, string> = {
  start: "VMを起動しました",
  stop: "VMを停止しました",
  shutdown: "VMをシャットダウンしました",
  reboot: "VMを再起動しました",
  reset: "VMをリセットしました",
};

// 編集モーダル
const isEditOpen = ref(false);

const openEditModal = () => {
  if (!vm.value) return;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // 編集時のトーストはモーダル側で出す想定
  try {
    await refresh();
  } catch (e) {
    console.error("VM再取得に失敗しました", e);
    addToast({ message: "再取得に失敗しました", type: "error" });
  }
};

// 確認ダイアログ
const confirmDialog = ref({
  show: false,
  title: "",
  message: "",
  confirmText: "",
  actionValue: "",
});

// 確認が必要なアクションのメッセージ設定
const confirmationConfig: Record<
  string,
  { title: string; message: string; confirmText: string }
> = {
  stop: {
    title: "停止の確認",
    message:
      "仮想マシンを強制停止します。\n保存されていないデータは失われる可能性があります。\n本当に停止しますか？",
    confirmText: "停止する",
  },
  shutdown: {
    title: "シャットダウンの確認",
    message:
      "仮想マシンをシャットダウンします。\n実行中のプロセスが正常に終了するまで時間がかかる場合があります。\n本当にシャットダウンしますか？",
    confirmText: "シャットダウンする",
  },
  reset: {
    title: "リセットの確認",
    message:
      "仮想マシンを強制的にリセットします。\n保存されていないデータは失われる可能性があります。\n本当にリセットしますか？",
    confirmText: "リセットする",
  },
};

const closeConfirmDialog = () => {
  confirmDialog.value.show = false;
  confirmDialog.value.actionValue = "";
};

const executeConfirmedAction = async () => {
  const actionValue = confirmDialog.value.actionValue;
  closeConfirmDialog();

  if (!actionValue) return;

  await executeAction(actionValue);
};

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (!vm.value) return;

  // 編集
  if (action.value === "edit") {
    openEditModal();
    return;
  }

  // 確認が必要なアクション
  if (confirmationConfig[action.value]) {
    const config = confirmationConfig[action.value];
    confirmDialog.value = {
      show: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      actionValue: action.value,
    };
    return;
  }

  // 確認不要なアクション（起動、再起動など）は直接実行
  await executeAction(action.value);
};

// 実際のアクション実行処理
const executeAction = async (actionValue: string) => {
  if (!vm.value) return;

  const endpoint = actionEndpointMap[actionValue];

  if (!endpoint) {
    addToast({
      message: `未対応のアクションです`,
      type: "error",
    });
    return;
  }

  try {
    type VmActionResponse = {
      message: string;
      data: {
        id: string;
        status?: VirtualMachineResponse["status"];
      };
    };

    const res = await apiClient.post<VmActionResponse>(
      `${MACHINE.name}/${vm.value.id}/${endpoint}`,
      { action: action.value },
    );

    // ステータス反映
    if (res.data?.status) {
      vm.value = { ...vm.value, status: res.data.status };
    }

    addToast({
      message: actionSuccessMessage[actionValue] ?? res.message,
      type: "success",
    });
  } catch (e) {
    console.error("操作失敗:", actionValue, e);
    addToast({
      message: `操作に失敗しました`,
      type: "error",
    });
  }
};
</script>
