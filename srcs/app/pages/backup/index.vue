<!-- pages/backup_management/index.vue -->
<template>
  <div>
    <DashboardLayout
      title="バックアップ・復元管理"
      :columns="columns"
      :rows="backups"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/backup/${row.id}`" class="table-link">
          {{ row.name }}
          <div
            v-if="row.description"
            class="cell-description text-sm text-gray-500"
          >
            {{ row.description }}
          </div>
        </NuxtLink>
      </template>

      <template #cell-createdAtText="{ row }">
        <span>{{ row.createdAtText }}</span>
      </template>

      <template #cell-sizeText="{ row }">
        <span class="font-mono">{{ row.sizeText }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink :to="`/backup/${row?.id}`" class="action-item">詳細</NuxtLink>

        <button
          type="button"
          class="action-item action-item-primary"
          @click.stop.prevent="row && onRowAction({ action: 'restore', row })"
        >
          復元
        </button>

        <button
          type="button"
          class="action-item action-item-danger"
          :disabled="isDeleting && targetForDeletion?.id === row?.id"
          @click.stop.prevent="row && onRowAction({ action: 'delete', row })"
        >
          削除
        </button>
      </template>
    </DashboardLayout>

    <!-- 作成モーダル -->
    <MoBackupCreate
      :show="activeModal === ADD_BACKUP_ACTION"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- 削除確認モーダル -->
    <MoDeleteConfirm
      :show="activeModal === DELETE_BACKUP_ACTION"
      :message="`本当にバックアップ「${targetForDeletion?.name}」を削除しますか？`"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />

    <!-- 復元モーダル（存在しない場合は無視されます） -->
    <MoBackupRestore
      :show="activeModal === RESTORE_BACKUP_ACTION"
      :data="targetForEditing?.originalData ?? targetForEditing ?? undefined"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { BACKUP } from "@/utils/constants";
import {
  useBackupManagement,
  type BackupRow,
} from "~/composables/dashboard/useBackupManagement";
import { usePageActions } from "~/composables/usePageActions";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoBackupCreate from "~/components/MoBackupCreate.vue";
import MoBackupRestore from "~/components/MoBackupRestore.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";

/* データ取得 */
const {
  columns,
  headerButtons,
  rows: backups,
  refresh,
  ADD_BACKUP_ACTION,
  DELETE_BACKUP_ACTION,
  RESTORE_BACKUP_ACTION,
} = useBackupManagement();

/* ページ共通アクション */
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<BackupRow>({
  resourceName: BACKUP.name,
  resourceLabel: BACKUP.label,
  refresh,
});

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "add") {
    openModal(ADD_BACKUP_ACTION);
  }
}

/* 行アクションのハンドラー（復元処理を含む） */
function onRowAction({ action, row }: { action: string; row: BackupRow }) {
  if (action === "restore") {
    targetForEditing.value = row;
    openModal(RESTORE_BACKUP_ACTION);
    return;
  }
  handleRowAction({ action, row });
}
</script>
