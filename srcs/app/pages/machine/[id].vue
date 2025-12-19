<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!vm && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!vm && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- vm が一度でも取得できたら、以降は常にこれ -->
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { MACHINE } from "~/utils/constants";
import { createPolling } from "~/utils/polling";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import { vmTabs } from "~/composables/detail/useVmTabs";

import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "@/composables/useToast";
import { useApiClient } from "~/composables/useResourceClient";

type VirtualMachineResponse =
  components["schemas"]["VirtualMachineResponse"];

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
  route.params.id as string
);

// --- ポーリング設定 ---
const polling = createPolling(async () => {
  await refresh();
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
