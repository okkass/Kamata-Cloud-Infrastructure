<!-- app/pages/user-management/index.vue -->
<template>
  <DashboardLayout
    title="利用者管理"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="() => openModal(ADD_USER_ACTION)"
    @row-action="handleRowAction"
  >
    <template #cell-account="{ row }">
      <NuxtLink :to="`/users/${row.id}`" class="table-link">
        {{ row.account }}
        <div
          v-if="row.description"
          class="cell-description text-sm text-gray-500"
        >
          {{ row.description }}
        </div>
      </NuxtLink>
    </template>

    <template #cell-email="{ row }">
      <span class="font-mono">{{ row.email }}</span>
    </template>

    <template #cell-limitsText="{ row }">
      <span class="font-mono">{{ row.limitsText }}</span>
    </template>

    <template #cell-lastLoginText="{ row }">
      <span>{{ row.lastLoginText }}</span>
    </template>

    <template #row-actions="{ row }">
      <NuxtLink v-if="row" :to="`/users/${row.id}`" class="action-item"
        >詳細</NuxtLink
      >
      <button
        class="action-item"
        @click.stop.prevent="row && handleRowAction({ action: 'edit', row })"
      >
        編集
      </button>
      <button
        class="action-item action-item-danger"
        @click.stop.prevent="row && handleRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <MoUserAdd
    :show="activeModal === ADD_USER_ACTION"
    @close="closeModal"
    @success="handleSuccess"
  />

  <!-- 編集モーダルがプロジェクトで使われている場合は usePageActions の targetForEditing を渡すための実装を追加してください -->
  <MoDeleteConfirm
    :show="activeModal === DELETE_USER_ACTION"
    :message="`本当に「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoUserAdd from "@/components/MoUserAdd.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import { useUserManagement } from "@/composables/useUserManagement";
import { usePageActions } from "@/composables/usePageActions";
import type { UserRow } from "@/composables/useUserManagement";

const ADD_USER_ACTION = "add-users";
const EDIT_USER_ACTION = "edit-users";
const DELETE_USER_ACTION = "delete-users";

const { columns, headerButtons, rows, refresh } = useUserManagement();

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
  resourceName: "users",
  resourceLabel: "利用者",
  refresh,
});
</script>
