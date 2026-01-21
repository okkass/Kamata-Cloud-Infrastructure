<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロード中のみ表示 -->
    <div v-if="pending && !stableVnet" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <!-- 一度でも取得できたら常に表示（pending で消さない） -->
    <ResourceDetailShell
      v-else-if="stableVnet"
      title="仮想ネットワーク詳細"
      subtitle="Virtual Network Information"
      :tabs="vnTabs"
      :context="stableVnet!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル（管轄外・触らない） -->
    <MoVirtualNetworkEdit
      v-if="stableVnet"
      :show="isEditOpen"
      :networkData="targetVnet"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { vnTabs } from "~/composables/detail/useVnTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "@/composables/useToast";
import MoVirtualNetworkEdit from "@/components/MoVirtualNetworkEdit.vue";
import { NETWORK } from "@/utils/constants";
import { createPolling } from "@/utils/polling";
import { useResourceErrorGuard } from "~/composables/useResourceErrorGuard";

const { addToast } = useToast();

const route = useRoute();
const router = useRouter();

// ---------- データ取得 ----------
const {
  data: vnet,
  pending,
  error,
  refresh,
} = await useResourceDetail<VirtualNetworkResponse>(
  NETWORK.name,
  route.params.id as string,
);

// エラーをカスタムエラーページに統一
useResourceErrorGuard(vnet, pending, error);

// ---------- 表示を安定させるための保持用 ----------
const stableVnet = ref<VirtualNetworkResponse | null>(null);

watch(
  () => vnet.value,
  (val) => {
    if (val) stableVnet.value = val;
  },
  { immediate: true },
);

// ---------- 戻る ----------
const goBack = () => {
  router.back();
};

// ---------- 操作 ----------
const actions = ref([{ label: "編集", value: "edit" }]);
const isEditOpen = ref(false);
const targetVnet = ref<VirtualNetworkResponse | null>(null);

const handleAction = (action: { label: string; value: string }) => {
  if (!stableVnet.value) return;
  if (action.value === "edit") {
    targetVnet.value = vnet.value;
    isEditOpen.value = true;
  }
};

const handleEditClose = () => {
  isEditOpen.value = false;
  targetVnet.value = null;
};

// モーダル側で emit("success") されたとき
const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // データを再取得して画面を更新
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("仮想ネットワーク再取得に失敗しました", e);
    }
  }
};

// ---------- polling 制御（ここが今回の本命） ----------
const { startPolling, stopPolling, runOnce } = createPolling(async () => {
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("仮想ネットワーク情報の自動更新に失敗しました", e);
    }
  }
});

// 初期表示後に polling 開始
onMounted(() => {
  startPolling(3000); // 3秒おき（必要なら調整）
});

// ページ離脱時に停止
onUnmounted(() => {
  stopPolling();
});

// モーダル開閉に応じて polling を制御
watch(isEditOpen, async (isOpen) => {
  if (isOpen) {
    // 編集中は自動再取得しない
    stopPolling();
  } else {
    // 閉じたら1回だけ取得 → 少し待ってから再開
    await runOnce();
    // runOnce() による refresh 完了直後に polling が同時実行されるのを避けるため、短い遅延を挟む
    await new Promise((resolve) => setTimeout(resolve, 100));
    startPolling(5000);
  }
});
</script>
