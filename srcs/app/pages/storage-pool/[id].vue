<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      title="ストレージプール詳細"
      subtitle="Storage Pool Information"
      :tabs="storagePoolTabs"
      :context="pool!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル -->
    <MoStorageEdit
      v-if="pool"
      :show="isEditOpen"
      :storageData="pool"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { STORAGE } from "~/utils/constants";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import { useResourceDetail } from "~/composables/useResourceDetail";

// Tabs
import { storagePoolTabs } from "~/composables/detail/useStoragePoolTabs";

// 編集モーダル
import MoStorageEdit from "~/components/MoStorageEdit.vue";

const route = useRoute();
const router = useRouter();

// データ取得
const {
  data: pool,
  pending,
  error,
  refresh,
} = await useResourceDetail<StoragePoolResponse>(
  STORAGE.name,
  route.params.id as string
);

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（編集のみ）
const actions = ref([
  { label: "編集", value: "edit" },
]);

// 編集モーダル制御
const isEditOpen = ref(false);

const openEditModal = () => {
  if (!pool.value) return;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // VM詳細と同じ：成功トーストはモーダル側に任せる
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("ストレージプール再取得に失敗しました", e);
    }
  }
};

// 操作ハンドラ
const handleAction = async (action: { label: string; value: string }) => {
  if (action.value === "edit") {
    openEditModal();
    return;
  }
};
</script>
