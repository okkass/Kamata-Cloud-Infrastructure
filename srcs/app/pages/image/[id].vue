<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!image && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <div v-else-if="!image && error" class="text-sm text-red-500">
      エラーが発生しました：{{ error.message }}
    </div>

    <!-- image が一度でも取得できたら、以降は常にこれ -->
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

    <!-- 編集モーダル（モーダル側に触らず、ページ側で初期値注入を保証） -->
    <MoImageEdit
      :show="isEditOpen"
      :data="editImageData"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { IMAGE } from "~/utils/constants";
import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoImageEdit from "~/components/MoImageEdit.vue";
import { imageTabs } from "~/composables/detail/useImageTabs";

const { addToast } = useToast();

const route = useRoute();
const router = useRouter();

const {
  data: image,
  pending,
  error,
  refresh,
} = await useResourceDetail<ImageResponse>(
  IMAGE.name,
  route.params.id as string
);

// --- ポーリング設定 ---
const polling = createPolling(async () => {
  await refresh();
});

// lifecycle
onMounted(() => {
  polling.startPolling();
});

onUnmounted(() => {
  polling.stopPolling();
});

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// 編集モーダル
const isEditOpen = ref(false);

// ★ モーダルに渡すデータ（ページ側で“変化”を作って初期化を確実にする）
const editImageData = ref<ImageResponse | null>(null);

const openEditModal = async () => {
  if (!image.value) return;

  // モーダル側が imageData の変化で初期化する実装でも確実に発火させる
  editImageData.value = null;
  await nextTick();

  editImageData.value = image.value;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  try {
    await refresh();
  } catch (e) {
    console.error("Image再取得に失敗しました", e);
    addToast({ message: "再取得に失敗しました", type: "error" });
  }

  // 次回の編集も確実に初期値が入るように同期しておく
  if (image.value) {
    editImageData.value = image.value;
  }
};

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (!image.value) return;

  if (action.value === "edit") {
    await openEditModal();
    return;
  }

  addToast({
    message: `未対応のアクションです: ${action.label}`,
    type: "error",
  });
};
</script>
