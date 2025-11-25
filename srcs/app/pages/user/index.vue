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

  <MoUserAdd
    :show="activeModal === ADD_USERS_MODAL"
    @close="closeModal"
    @success="onAddSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === DELETE_USERS_MODAL"
    :message="`「${targetForDeletion?.account}」を削除します。よろしいですか？`"
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

/* header-action のペイロード形状はプロジェクトにより違うので寛容に受け取る
   例: "add" / { key: "add" } / { action: "add" } / ボタンオブジェクトそのもの 等 */
function onHeaderAction(e: unknown) {
  if (e == null) return;
  let key: string | undefined;

  if (typeof e === "string") key = e;
  else if (typeof e === "object") {
    // try common properties
    // @ts-ignore
    key = e.key ?? e.action ?? e.type ?? e.name ?? e.label;
    if (typeof key !== "string") {
      // ボタンオブジェクトが渡されるケースで key プロパティがない場合は 'add' を想定することもある
      // headerButtons 内の first-primary を開く挙動を残したいならここで判定を追加
      // まずは key が取れなければ終了
      key = undefined;
    }
  }

  if (!key) return;

  // 互換性のため複数キーを許容
  if (key === "add" || key === "create" || key === ADD_USERS_MODAL) {
    openModal(ADD_USERS_MODAL);
    return;
  }

  // 他のヘッダ操作があればここに追加
}

/* 行アクション: edit => 編集モーダル（または詳細）、delete => 削除モーダル */
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
    targetForEditing.value = row;
    openModal(EDIT_USERS_MODAL);
    return;
  }

  if (action === "delete") {
    targetForDeletion.value = row;
    openModal(DELETE_USERS_MODAL);
    return;
  }

  if (typeof handleRowAction === "function") handleRowAction({ action, row });
}

async function onAddSuccess(msg?: string) {
  if (msg) addToast({ type: "success", message: msg });
  closeModal();
  await refresh();
}
</script>
