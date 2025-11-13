<template>
  <DashboardLayout
    title="仮想ネットワーク"
    :columns="columns"
    :rows="visibleRows"
    rowKey="id"
    :headerButtons="headerButtons"
    no-ellipsis
    @header-action="handleHeaderAction"
    @row-action="onRowAction"
  >
    <!-- 名称＋説明 -->
    <template #cell-name="{ row }">
      <NuxtLink :to="`/virtual-network/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
      <div v-if="row.description" class="text-sm text-gray-500 mt-0.5">
        {{ row.description }}
      </div>
    </template>

    <!-- CIDR -->
    <template #cell-cidr="{ row }">
      <span class="font-mono">{{ row.cidr }}</span>
    </template>

    <!-- サブネット数 -->
    <template #cell-subnets="{ row }">
      <span class="font-mono">{{ row.subnets }}</span>
    </template>

    <!-- 作成日時 -->
    <template #cell-createdAtText="{ row }">
      <span>{{ row.createdAtText }}</span>
    </template>

    <!-- 行アクション（編集は詳細へ、削除は確認モーダル） -->
    <template #row-actions="{ row }">
      <div>
        <button
          type="button"
          class="action-item"
          @click.stop.prevent="onRowAction({ action: 'edit', row })"
        >
          編集
        </button>
        <button
          type="button"
          class="action-item action-item-danger"
          @click.stop.prevent="onRowAction({ action: 'delete', row })"
        >
          削除
        </button>
      </div>
    </template>
  </DashboardLayout>

  <!-- 削除確認モーダルのみ利用（他モーダルは未実装のためページ依存を避ける） -->
  <MoDeleteConfirm
    :show="activeModal === deleteVNetAction"
    :message="`本当に仮想ネットワーク「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelActionSafe"
    @confirm="handleDeleteSafe"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import { useVNetManagement, VNetRow } from "@/composables/useVNetManagement";
import { usePageActions } from "@/composables/usePageActions";

/* 定数 */
const VNET = { name: "virtual-networks", label: "仮想ネットワーク" } as const;
const createVNetAction = "create-vnet";
const editVNetAction = "edit-vnet";
const deleteVNetAction = "delete-vnet";

/* composable から列・ボタン・行データを取得 */
const { columns, headerButtons, rows, refresh } = useVNetManagement();

const router = useRouter();

/* usePageActions を再利用（refresh を渡す） */
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  cancelAction,
} = usePageActions<VNetRow>({
  resourceName: VNET.name,
  resourceLabel: VNET.label,
  refresh,
});

/* 可視行（フロント削除は targetForDeletion の扱いに依存せず removedIds で対応） */
const removedIds = ref(new Set<string>());
const visibleRows = computed(() =>
  (rows.value ?? []).filter((r) => !removedIds.value.has(r.id))
);

/* 安全ラッパー */
function openModalSafe(name: string) {
  if (typeof openModal === "function") {
    try {
      openModal(name);
    } catch (e) {
      console.error("openModal error:", e);
    }
  } else {
    console.warn("openModal not available");
  }
}
function handleRowActionSafe(payload: { action: string; row: VNetRow }) {
  if (typeof handleRowAction === "function") {
    try {
      handleRowAction(payload);
    } catch (e) {
      console.error("handleRowAction error:", e);
    }
  } else {
    console.warn("handleRowAction not available");
  }
}
async function handleDeleteSafe() {
  if (typeof handleDelete === "function") {
    try {
      await handleDelete();
    } catch (e) {
      console.error("handleDelete error:", e);
    }
  } else {
    // fallback: フロントで削除対象が set されていれば除外する
    if (targetForDeletion && targetForDeletion.value) {
      removedIds.value.add(targetForDeletion.value.id);
      if (typeof closeModal === "function") closeModal();
      if (typeof refresh === "function") await refresh();
    } else {
      console.warn("handleDelete not available and no targetForDeletion");
    }
  }
}
function cancelActionSafe() {
  if (typeof cancelAction === "function") {
    try {
      cancelAction();
    } catch (e) {
      console.error("cancelAction error:", e);
    }
  } else if (typeof closeModal === "function") {
    closeModal();
  } else {
    console.warn("cancelAction/closeModal not available");
  }
}

/* ヘッダアクション: 現状は詳細未実装なので404へ遷移（将来モーダル置換可能） */
function handleHeaderAction(action: string) {
  if (action === "create" || action === "add" || action === createVNetAction) {
    // 将来モーダル実装時は openModalSafe(createVNetAction)
    router.push("/404").catch(() => {});
  } else {
    console.info("header action:", action);
  }
}

/* 行アクション: edit -> 詳細（未実装は404）、delete -> 削除モーダル表示 */
function onRowAction(payload: { action: string; row: VNetRow }) {
  const { action, row } = payload;
  if (!row) return;

  if (action === "edit") {
    // 詳細/編集画面が未実装なので詳細ページへ遷移（404 になる場合あり）
    router.push(`/virtual-network/${row.id}`).catch(() => {});
    return;
  }

  if (action === "delete") {
    if (targetForDeletion) {
      targetForDeletion.value = row;
      openModalSafe(deleteVNetAction);
    } else {
      // フォールバック: フロント削除
      const confirmed = window.confirm(
        `本当に仮想ネットワーク「${row.name}」を削除しますか？`
      );
      if (!confirmed) return;
      removedIds.value.add(row.id);
      console.info("deleted (front-only):", row.id);
    }
    return;
  }

  // その他は composable の共通ハンドラへ委譲
  handleRowActionSafe({ action, row });
}
</script>
