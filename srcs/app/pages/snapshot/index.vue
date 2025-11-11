<template>
  <DashboardLayout
    title="スナップショット"
    :columns="columns"
    :rows="displaySnapshots"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
    @row-action="onRowAction"
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
    :show="activeModal === createSnapshotAction"
    @close="closeModal"
    @success="onCreateSuccess"
  />

  <MoSnapshotRestore
    :show="activeModal === restoreSnapshotAction"
    :target-row="targetForEditing"
    @close="closeModal"
    @success="onRestoreSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === deleteSnapshotAction"
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
} = usePageActions<UiRow>({
  resourceName: SNAPSHOT.name,
  resourceLabel: SNAPSHOT.label,
  refresh,
});

const handleHeaderAction = (action: string) => {
  if (action === "create") {
    openModal(createSnapshotAction);
  }
};
const onRowAction = ({ action, row }: { action: string; row: UiRow }) => {
  if (action === "restore") {
    targetForEditing.value = row;
    openModal(restoreSnapshotAction);
    return;
  }
  handleRowAction({ action, row });
};

// モーダル作成成功ハンドラ：モーダルを閉じて一覧をリフレッシュ
const onCreateSuccess = async () => {
  closeModal();
  await refresh();
};
const onRestoreSuccess = async () => {
  closeModal();
  await refresh();
};
</script>
