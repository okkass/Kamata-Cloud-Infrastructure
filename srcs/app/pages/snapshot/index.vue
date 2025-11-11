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
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue"; // 追加

type UiRow = {
  id: string;
  name: string;
  vmName: string;
  createdAtText: string;
  description?: string;
};

const { columns, headerButtons, displaySnapshots, refresh } =
  useSnapshotManagement();

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
} = usePageActions<UiRow>({ resourceName: "snapshots", refresh });

const handleHeaderAction = (action: string) => {
  if (action === "add") openModal("add-snapshots");
};
const onRowAction = ({ action, row }: { action: string; row: UiRow }) => {
  if (action === "restore") {
    targetForEditing.value = row;
    openModal("restore-snapshots");
    return;
  }
  if (action === "delete") {
    targetForDeletion.value = row;
    openModal("delete-snapshots");
    return;
  }
  handleRowAction({ action, row });
};

// モーダル作成成功ハンドラ：モーダルを閉じて一覧をリフレッシュ
const onCreateSuccess = async () => {
  closeModal();
  await refresh();
};
</script>
