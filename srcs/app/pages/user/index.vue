<!-- app/pages/user-management/index.vue -->
<template>
  <DashboardLayout
    title="利用者管理ダッシュボード"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    :rowActions="rowActions"
    no-ellipsis
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <template #cell-account="{ row }">
      <div>
        <span class="table-link">{{ row.account }}</span>
        <span v-if="row.description" class="text-sm text-gray-500 block mt-0.5">
          {{ row.description }}
        </span>
      </div>
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

    <!-- 右端 操作メニュー（DashboardLayout標準のケバブ） -->
    <template #row-actions="{ row }">
      <button
        class="action-item"
        @click.stop="onRowAction({ action: 'edit', row })"
      >
        編集
      </button>
      <button
        class="action-item action-item-danger"
        @click.stop="onRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <!-- 利用者追加モーダル（/workspace/srcs/app/components/MoUserAdd.vue） -->
  <MoUserAdd
    :show="activeModal === 'add-users'"
    @close="closeModal"
    @success="onAddSuccess"
  />

  <!-- 既存の削除モーダル -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-users'"
    :message="`「${targetForDeletion?.account}」を削除します。よろしいですか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoUserAdd from "@/components/MoUserAdd.vue";
import { useUserManagement } from "@/composables/useUserManagement";
import { usePageActions } from "@/composables/usePageActions";
import { useToast } from "@/composables/useToast";

type UiRow = {
  id: string;
  account: string;
  email: string;
  limitsText: string;
  lastLoginText: string;
  description?: string;
};

const { columns, headerButtons, rows, refresh } = useUserManagement();

const rowActions = [
  { key: "edit", label: "編集" },
  { key: "delete", label: "削除", danger: true },
];

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
} = usePageActions<UiRow>({ resourceName: "users", refresh });

const { toast } = useToast();

const onHeaderAction = (action: string) => {
  if (action === "add") openModal("add-users"); // MoUserAdd を開く
};

const onRowAction = ({ action, row }: { action: string; row: UiRow }) => {
  if (action === "edit") {
    targetForEditing.value = row;
    openModal("edit-users");
    return;
  }
  if (action === "delete") {
    targetForDeletion.value = row;
    openModal("delete-users");
    return;
  }
  handleRowAction({ action, row });
};

const onAddSuccess = (msg?: string) => {
  if (msg) toast.success(msg);
  closeModal();
  refresh();
};
</script>
