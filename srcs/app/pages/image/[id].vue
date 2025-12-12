<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="pending" class="text-sm text-neutral-500">読み込み中…</div>

    <div v-else-if="error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <ResourceDetailShell
      v-else
      title="イメージ詳細"
      subtitle="Image Information"
      :tabs="imageTabs"
      :context="image!"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル（型の正はImageResponseなので、ここではデータを渡さない） -->
    <MoImageEdit
      :show="isEditOpen"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { IMAGE } from "~/utils/constants";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";

// Tabs
import { imageTabs } from "~/composables/detail/useImageTabs";

// composables
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useToast } from "~/composables/useToast";

const { addToast } = useToast();

const route = useRoute();
const router = useRouter();

// Image データ取得（正は ImageResponse）
const {
  data: image,
  pending,
  error,
  refresh,
} = await useResourceDetail<ImageResponse>(
  IMAGE.name,
  route.params.id as string
);

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル
const isEditOpen = ref(false);

const openEditModal = () => {
  if (!image.value) return;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // モーダル側でトーストを出す想定
  if (typeof refresh === "function") {
    try {
      await refresh();
    } catch (e) {
      console.error("Image再取得に失敗しました", e);
      addToast({ message: "再取得に失敗しました", type: "error" });
    }
  }
};

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (!image.value) return;

  if (action.value === "edit") {
    openEditModal();
    return;
  }

  addToast({
    message: `未対応のアクションです: ${action.label}`,
    type: "error",
  });
};
</script>
