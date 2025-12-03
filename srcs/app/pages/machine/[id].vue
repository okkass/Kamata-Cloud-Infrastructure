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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { vmTabs } from "~/composables/detail/usevmtabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "@/composables/useToast";

const { addToast } = useToast();

type VmDetail = {
  id: string;
  name: string;
  createdAt: string;
  status: string;
  node?: {
    name?: string;
    ipAddress?: string;
    status?: string;
  };
  cpuCore?: number;
  memorySize?: number | string;
  attachedStorages?: { id: string; name: string; size: number }[];
  securityGroups?: { id: string; name: string; createdAt?: string }[];
  nics?: { id: string; name: string; ip: string }[];
};

const route = useRoute();
const router = useRouter();

// VM 詳細取得
const {
  data: vm,
  pending,
  error,
} = await useResourceDetail<VmDetail>(
  "virtual-machines",
  route.params.id as string
);

// 戻るボタン
const goBack = () => {
  router.back();
};

// 操作メニューの中身（モック API に合わせた値）
const actions = ref([
  { label: "起動", value: "start" },
  { label: "停止", value: "stop" },
  { label: "シャットダウン", value: "shutdown" },
  { label: "再起動", value: "reboot" },
  { label: "リセット", value: "reset" },
  { label: "編集", value: "edit" },
]);

// value → 実際のエンドポイント末尾
const actionEndpointMap: Record<string, string> = {
  start: "start",
  stop: "stop",
  shutdown: "shutdown",
  reboot: "reboot",
  reset: "reset",
};

// アクションごとの日本語メッセージ
const actionSuccessMessage: Record<string, string> = {
  start: "VMを起動しました",
  stop: "VMを停止しました",
  shutdown: "VMをシャットダウンしました",
  reboot: "VMを再起動しました",
  reset: "VMをリセットしました",
};

// detail-test.vue っぽい handleAction（＋API呼び出し付き）
const handleAction = async (action: { label: string; value: string }) => {
  if (!vm.value) return;

  const endpoint = actionEndpointMap[action.value];

  if (!endpoint) {
    console.warn("未対応のアクション:", action.value);
    addToast({
      message: `未対応のアクションです: ${action.label}`,
      type: "error",
    });
    return;
  }

  try {
    const res = await $fetch<{
      message: string;
      data: { id: string; status?: string };
    }>(`/api/virtual-machines/${vm.value.id}/${endpoint}`, {
      method: "POST",
      body: {
        action: action.value,
      },
    });

    console.log("操作成功:", action.value, res);

    // API からステータスが返ってくる場合は vm.status を更新
    if (res.data?.status) {
      vm.value = {
        ...vm.value,
        status: res.data.status,
      };
    }

    // detail-test っぽくトーストでフィードバック
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
