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
      @action="onAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { vmTabs } from "~/composables/detail/usevmtabs";
import { useResourceDetail } from "~/composables/useResourceDetail";

// ---- 型（APIの戻りに合わせて適宜修正してOK） ----
type VmDetail = {
  id: string;
  name: string;
  createdAt: string;
  node: string;
  status: string;
  cpuCore: number;
  memorySize: string | number;
  attachedStorages?: { id: string; name: string; size: number }[];
  securityGroups?: { id: string; name: string }[];
  nics?: { id: string; name: string; ip: string }[];
  // 使用率グラフなどがあればここに追加
};

const route = useRoute();
const router = useRouter();

// ---- 詳細取得（投げてもらった useResourceDetail を利用） ----
// ※ エンドポイント名は実際のAPIに合わせて 'machines' 部分を変えてね
const {
  data: vm,
  pending,
  error,
} = await useResourceDetail<VmDetail>("virtual-machines", route.params.id as string);

// ---- 戻る（前のURLに戻る想定） ----
const goBack = () => {
  router.back();
};

// ---- 操作ボタンの中身（ここで全部定義） ----
const actions = ref([
  { label: "スタート", value: "start" },
  { label: "シャットダウン", value: "shutdown" },
  { label: "再起動", value: "reboot" },
  { label: "強制再起動", value: "force-reboot" },
  { label: "強制停止", value: "force-stop" },
  { label: "編集", value: "edit" },
]);

// ---- 操作実行（API 呼び出し） ----
const onAction = async (action: { label: string; value: string }) => {
  if (!vm.value) return;

  // ここは実際のAPI仕様に合わせてパスを調整してください
  // 例: POST /api/machines/:id/actions/:action
  try {
    await $fetch(`/api/machines/${vm.value.id}/actions/${action.value}`, {
      method: "POST",
    });
    console.log("操作成功:", action.value);
    // 必要なら再取得
    // await refreshNuxtData(`useResourceDetail-machines-${vm.value.id}`);
  } catch (e) {
    console.error("操作失敗:", action.value, e);
  }
};
</script>
