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
      :network-data="vnet"
      @close="handleEditClose"
      @save="handleEditSave"
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

// ★ 変更: VirtualNetworkResponse を元にした画面用ローカル型に揃えた
type VirtualNetworkDetail = {
  id: string;
  name: string;
  cidr: string;        // ← 必須に変更（?: を削除）
  createdAt: string;   // ← 必須に変更（?: を削除）
  subnets?: {
    id: string;
    name: string;
    cidr: string;
    createdAt: string; // ← external ではなく createdAt に統一
  }[];
};

const route = useRoute();
const router = useRouter();

const {
  data: vnet,
  pending,
  error,
  refresh,
} = await useResourceDetail<VirtualNetworkDetail>(
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

const handleAction = (action: { label: string; value: string }) => {
  if (!vnet.value) return;

  if (action.value === "edit") {
    isEditOpen.value = true;
  }
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

// モーダル側で emit("save", editableNetwork) されたとき
// ★ 変更: 引数の型も VirtualNetworkDetail に揃えた
const handleEditSave = async (updated: VirtualNetworkDetail) => {
  // ひとまずローカルの表示を更新
  vnet.value = updated;
  isEditOpen.value = false;

  addToast({
    message: "仮想ネットワークの情報を更新しました（ダミー）",
    type: "success",
  });

  // 将来 API を実装したらサーバの内容を取り直したい場合：
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("仮想ネットワーク再取得に失敗しました", e);
    }
  }
};
</script>
