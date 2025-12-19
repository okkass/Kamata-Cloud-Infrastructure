<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      title="仮想ネットワーク詳細"
      subtitle="Virtual Network Information"
      :tabs="vnTabs"
      :context="vnet!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoVirtualNetworkEdit
      v-if="vnet"
      :show="isEditOpen"
      :networkData="targetVnet"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { vnTabs } from "~/composables/detail/useVnTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "@/composables/useToast";
import MoVirtualNetworkEdit from "@/components/MoVirtualNetworkEdit.vue";
import { NETWORK } from "@/utils/constants";

const { addToast } = useToast();

const route = useRoute();
const router = useRouter();

const {
  data: vnet,
  pending,
  error,
  refresh,
} = await useResourceDetail<VirtualNetworkResponse>(
  NETWORK.name, // "virtual-networks"
  route.params.id as string
);

const goBack = () => {
  router.back();
};

// 操作メニュー（とりあえず編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル開閉
const isEditOpen = ref(false);
const targetVnet = ref<VirtualNetworkResponse | null>(null);

const handleAction = (action: { label: string; value: string }) => {
  if (!vnet.value) return;

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
</script>
