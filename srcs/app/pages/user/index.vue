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
        <div v-if="row.description" class="text-sm text-gray-500 mt-0.5">
          {{ row.description }}
        </div>
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

    <template #row-actions="{ row }">
      <button
        class="action-item"
        @click.stop="onRowAction({ action: 'edit', row })"
      >
        詳細
      </button>
      <button
        class="action-item action-item-danger"
        @click.stop="onRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <MoUserAdd
    :show="activeModal === ADD_USERS_MODAL"
    @close="closeModal"
    @success="onAddSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === DELETE_USERS_MODAL"
    :message="`「${targetForDeletion?.name}」を削除します。よろしいですか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoUserAdd from "@/components/MoUserAdd.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import {
  useUserManagement,
  type UserRow,
} from "@/composables/useUserManagement";
import { usePageActions } from "@/composables/usePageActions";
import { useToast } from "@/composables/useToast";

const ADD_USERS_MODAL = "add-users";
const EDIT_USERS_MODAL = "edit-users";
const DELETE_USERS_MODAL = "delete-users";

const { columns, headerButtons, rows, refresh } = useUserManagement();
const { addToast } = useToast();

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
} = usePageActions<UserRow>({
  resourceName: "users",
  resourceLabel: "利用者",
  refresh,
});

function onHeaderAction(e: string | { key?: string } | any) {
  const key = typeof e === "string" ? e : e?.key;
  if (key === "add" || key === "create" || key === ADD_USERS_MODAL) {
    openModal(ADD_USERS_MODAL);
  }
}

function onRowAction(
  payload:
    | { action?: string; key?: string; row?: UserRow; item?: UserRow }
    | any
) {
  if (!payload) return;
  const action = String(payload.action ?? payload.key ?? "");
  const row: UserRow | undefined = payload.row ?? payload.item;
  if (!row) return;

  if (action === "edit") {
    if (targetForEditing) targetForEditing.value = row;
    openModal(EDIT_USERS_MODAL);
    return;
  }

  if (action === "delete") {
    if (targetForDeletion) targetForDeletion.value = row;
    openModal(DELETE_USERS_MODAL);
    return;
  }

  handleRowAction({ action, row });
}

async function onAddSuccess(msg?: string) {
  if (msg) addToast({ type: "success", message: msg });
  closeModal();
  await refresh();
}
</script>
