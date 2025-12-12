<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
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
      :vm-id="vm.id"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MACHINE } from "~/utils/constants";
import { useApiClient } from "~/composables/useResourceClient";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";

// Tabs
import { vmTabs } from "~/composables/detail/useVmTabs";

// composables
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "@/composables/useToast";

const { addToast } = useToast();
const apiClient = useApiClient();

const route = useRoute();
const router = useRouter();

// VM データ取得
const {
  data: vm,
  pending,
  error,
  refresh,
} = await useResourceDetail<VirtualMachineResponse>(
  MACHINE.name,
  route.params.id as string
);

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

  // ここではトーストを出さず、モーダル側に任せる

  // 最新データ取得
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("VM再取得に失敗しました", e);
    }
  }
};

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (!vm.value) return;

  // 編集
  if (action.value === "edit") {
    openEditModal();
    return;
  }

  const endpoint = actionEndpointMap[action.value];

  if (!endpoint) {
    addToast({
      message: `未対応のアクションです: ${action.label}`,
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
      { action: action.value }
    );

    // ステータス反映
    if (res.data?.status) {
      vm.value = { ...vm.value, status: res.data.status };
    }

    addToast({
      message: actionSuccessMessage[action.value] ?? res.message,
      type: "success",
    });
  } catch (e) {
    console.error("操作失敗:", action.value, e);
    addToast({
      message: `操作に失敗しました: ${action.label}`,
      type: "error",
    });
  }
};
</script>
