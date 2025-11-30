<template>
  <div>
    <DashboardLayout
      title="利用者管理"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="onHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/users/${row.id}`" class="table-link">
          {{ row.name }}
        </NuxtLink>
      </template>

      <template #cell-email="{ row }">
        <span class="font-mono">{{ row.email }}</span>
      </template>

      <template #cell-limitsText="{ row }">
        <span class="font-mono text-sm">{{ row.limitsText }}</span>
      </template>

      <template #row-actions="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/users/${row.id}`" class="action-item">詳細</NuxtLink>

          <button
            class="action-item"
            @click.stop.prevent="onRowAction({ action: 'edit', row })"
          >
            編集
          </button>

          <button
            class="action-item action-item-danger"
            @click.stop.prevent="onRowAction({ action: 'delete', row })"
          >
            削除
          </button>
        </div>
      </template>
    </DashboardLayout>
  </div>

  <MoUserAdd
    :show="activeModal === 'add-users'"
    @close="closeModal"
    @success="handleSuccess"
  />

  <MoUserEdit
    :show="activeModal === 'edit-users'"
    :user-data="targetForEditing?.originalData"
    @close="closeModal"
    @success="handleSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === 'delete-users'"
    :message="`本当に利用者「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import {
  useUserManagement,
  type UserRow,
} from "~/composables/dashboard/useUserManagement";
import { usePageActions } from "~/composables/usePageActions";

// 1. データロジック
const { columns, headerButtons, rows, refresh } = useUserManagement();

// 2. アクションロジック
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
} = usePageActions<UserRow>({
  resourceName: USER.name,
  resourceLabel: USER.label,
  refresh,
});

// ヘッダーアクション（追加）
const onHeaderAction = (action: string) => {
  if (action === "add") {
    openModal("add-users");
  }
};

// 行アクション（編集・削除）
const onRowAction = ({ action, row }: { action: string; row: UserRow }) => {
  handleRowAction({ action, row });
};
</script>
