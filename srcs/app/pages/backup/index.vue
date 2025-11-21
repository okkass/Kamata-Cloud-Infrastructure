<!-- pages/backup_management/index.vue -->
<template>
  <div>
    <DashboardLayout
      title="バックアップ・復元管理"
      :columns="columns"
      :rows="backups"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="() => openModal(ADD_BACKUP_ACTION)"
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
          class="action-item action-item-danger"
          :disabled="isDeleting && targetForDeletion?.id === row?.id"
          @click.stop.prevent="
            row && handleRowAction({ action: 'delete', row })
          "
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

    <!-- 編集は未提供なら同じCreateを流用しない（必要なら追加実装） -->

    <!-- 削除確認モーダル -->
    <MoDeleteConfirm
      :show="activeModal === DELETE_BACKUP_ACTION"
      :message="`本当にバックアップ「${targetForDeletion?.name}」を削除しますか？`"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { useBackupManagement } from "@/composables/usebackup";
import { usePageActions } from "@/composables/usePageActions";
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoBackupCreate from "@/components/MoBackupCreate.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import type { BackupRow } from "@/composables/usebackup";

/* 定数 */
const BACKUP = { name: "backups", label: "バックアップ" } as const;
const ADD_BACKUP_ACTION = "add-backup";
const EDIT_BACKUP_ACTION = "edit-backup";
const DELETE_BACKUP_ACTION = "delete-backup";

/* データ / composable */
const {
  columns,
  headerButtons,
  rows: backups,
  refresh,
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
</script>
