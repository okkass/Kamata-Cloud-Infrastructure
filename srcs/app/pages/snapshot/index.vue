<template>
  <DashboardLayout
    title="スナップショット"
    :columns="columns"
    :rows="displaySnapshots"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
    @row-action="onRowAction"
    no-ellipsis
  >
    <template #cell-name="{ row }">
      <div>
        <span class="table-link">{{ row.name }}</span>
        <span v-if="row.description" class="text-sm text-gray-500 block mt-0.5">
          {{ row.description }}
        </span>
      </div>
    </template>

    <template #cell-vmName="{ row }">
      <span class="font-mono">{{ row.vmName }}</span>
    </template>

    <template #cell-createdAtText="{ row }">
      <span>{{ row.createdAtText }}</span>
    </template>

    <template #row-actions="{ row }">
      <div v-if="row">
        <button
          type="button"
          class="action-item"
          @click.stop.prevent="onRowAction({ action: 'restore', row })"
        >
          復元
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

  <!-- スナップショット作成モーダル -->
  <MoSnapshotCreate
    :show="activeModal === 'add-snapshots'"
    @close="closeModal"
    @success="onCreateSuccess"
  />

  <!-- 復元モーダル（仮置き） 一時コメントアウト -->
  <!--
  <MoSnapshotRestore
    :show="activeModal === 'restore-snapshots'"
    :target-row="targetForEditing"
    @close="closeModal"
    @success="onRestoreSuccess"
  />
  -->

  <MoDeleteConfirm
    :show="activeModal === 'delete-snapshots'"
    :message="`本当にスナップショット「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import { useSnapshotManagement } from "@/composables/useSnapshotManagement";
import { usePageActions } from "@/composables/usePageActions";
import MoSnapshotCreate from "@/components/MoSnapshotCreate.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
// import MoSnapshotRestore from "@/components/MoSnapshotRestore.vue"; // 一時コメントアウト

type UiRow = {
  id: string;
  name: string;
  vmName: string;
  createdAtText: string;
  description?: string;
};

// snapshot 管理 composable から一覧・列定義・refresh を取得する（必須）
const { columns, headerButtons, displaySnapshots, refresh } =
  useSnapshotManagement();

// resourceLabel を必須で渡す（型エラーを解消）
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
} = usePageActions<UiRow>({
  resourceName: "snapshots",
  resourceLabel: "スナップショット",
  refresh,
});

// header-action のハンドラ（"add" / "create" を吸収）
const handleHeaderAction = (action: string) => {
  if (action === "add" || action === "create") {
    if (typeof openModal === "function") {
      try {
        openModal("add-snapshots");
      } catch (e) {
        console.error("openModal error:", e);
      }
    } else {
      console.warn("openModal is not available");
    }
  }
};

// 行アクションハンドラ
const onRowAction = ({ action, row }: { action: string; row: UiRow }) => {
  if (action === "restore") {
    if (targetForEditing) {
      targetForEditing.value = row;
    } else {
      console.warn("targetForEditing is not available");
    }
    if (typeof openModal === "function") openModal("restore-snapshots");
    return;
  }

  if (action === "delete") {
    if (targetForDeletion) {
      targetForDeletion.value = row;
    } else {
      console.warn("targetForDeletion is not available");
    }
    if (typeof openModal === "function") openModal("delete-snapshots");
    return;
  }

  // その他は usePageActions に委譲（存在チェック）
  if (typeof handleRowAction === "function") {
    try {
      handleRowAction({ action, row });
    } catch (e) {
      console.error("handleRowAction error:", e);
    }
  } else {
    console.warn("handleRowAction is not available");
  }
};

// 作成成功ハンドラ：モーダルを閉じ、一覧リロード
const onCreateSuccess = async () => {
  if (typeof closeModal === "function") closeModal();
  if (typeof refresh === "function") await refresh();
};

// 復元成功ハンドラ（仮置き）：モーダル閉じて再取得
const onRestoreSuccess = async () => {
  if (typeof closeModal === "function") closeModal();
  if (typeof refresh === "function") await refresh();
};
</script>
