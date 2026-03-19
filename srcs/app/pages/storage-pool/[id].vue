<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 初回ロードだけ表示 -->
    <div v-if="!pool && pending" class="text-sm text-neutral-500">
      読み込み中…
    </div>

    <!-- pool が一度でも取得できたら、以降は常にこれ -->
    <ResourceDetailShell
      v-else-if="pool"
      title="ストレージプール詳細"
      subtitle="Storage Pool Information"
      :tabs="storagePoolTabs"
      :context="poolContext"
      :actions="actions"
      @back="goBack"
      @action="handleAction"
    />

    <!-- 編集モーダル（モーダル側に触らず、ページ側で初期値注入を保証） -->
    <MoStorageEdit
      :show="isEditOpen"
      :storage-data="editStorageData"
      @close="handleEditClose"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { STORAGE } from "~/utils/constants";
import { createPolling } from "~/utils/polling";

import ResourceDetailShell from "~/components/detail/ResourceDetailShell.vue";
import MoStorageEdit from "~/components/MoStorageEdit.vue";
import { storagePoolTabs } from "~/composables/detail/useStoragePoolTabs";
import { useResourceDetail } from "~/composables/useResourceDetail";
import { useResourceErrorGuard } from "~/composables/useResourceErrorGuard";

const poolContext = computed<Record<string, any> | undefined>(() => {
  return pool.value ?? undefined;
});

const route = useRoute();
const router = useRouter();

const {
  data: pool,
  pending,
  error,
  refresh,
} = await useResourceDetail<StoragePoolResponse>(
  STORAGE.name,
  route.params.id as string,
);

// エラーをカスタムエラーページに統一
useResourceErrorGuard(pool, pending, error);

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

// 編集モーダル開閉でポーリング制御（チカチカ/上書き防止）
const isEditOpen = ref(false);

watch(
  () => isEditOpen.value,
  (open) => {
    if (open) polling.stopPolling();
    else polling.startPolling();
  },
);

// 戻る
const goBack = () => {
  router.back();
};

// 操作メニュー（編集のみ）
const actions = ref([{ label: "編集", value: "edit" }]);

// ★ モーダルに渡すデータ（ページ側で“変化”を作って初期化を確実にする）
const editStorageData = ref<StoragePoolResponse | null>(null);

const openEditModal = async () => {
  if (!pool.value) return;

  // モーダル側が storageData の変化で初期化する実装でも確実に発火させる
  editStorageData.value = null;
  await nextTick();

  editStorageData.value = pool.value;
  isEditOpen.value = true;
};

const handleEditClose = () => {
  isEditOpen.value = false;
};

const handleEditSuccess = async () => {
  isEditOpen.value = false;

  // トースト不要：失敗時はログだけ
  try {
    await refresh();
  } catch (e) {
    console.error("StoragePool再取得に失敗しました", e);
  }

  // 次回の編集も確実に初期値が入るように同期しておく
  if (pool.value) {
    editStorageData.value = pool.value;
  }
};

// アクション実行
const handleAction = async (action: { label: string; value: string }) => {
  if (!pool.value) return;

  if (action.value === "edit") {
    await openEditModal();
  }
};
</script>
