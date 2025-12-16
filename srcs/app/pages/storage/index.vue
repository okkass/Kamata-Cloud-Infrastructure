<!-- app/pages/storage/index.vue -->
<template>
  <div>
    <DashboardLayout
      title="ストレージプール管理"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/storage/${row.id}`" class="table-link">
          {{ row.name }}
        </NuxtLink>
      </template>

      <template #cell-type="{ row }">
        <span>{{ row.type }}</span>
      </template>

      <template #cell-node="{ row }">
        <span>{{ row.node }}</span>
      </template>

      <template #cell-size="{ row }">
        <span class="font-mono">{{ row.size }}</span>
      </template>

      <template #cell-used="{ row }">
        <span class="font-mono">{{ row.used }}</span>
      </template>

      <template #cell-usage="{ row }">
        <span>{{ row.usage }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink v-if="row" :to="`/storage/${row.id}`" class="action-item">
          詳細
        </NuxtLink>
        <button
          type="button"
          class="action-item"
          @click.stop.prevent="row && onRowAction({ action: 'edit', row })"
        >
          編集
        </button>
        <button
          type="button"
          class="action-item action-item-danger"
          @click.stop.prevent="row && onRowAction({ action: 'delete', row })"
        >
          削除
        </button>
      </template>
    </DashboardLayout>

    <!-- ストレージ追加モーダル -->
    <MoStorageAdd
      :show="activeModal === ADD_STORAGE_ACTION"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- 削除確認モーダル -->
    <MoDeleteConfirm
      :show="activeModal === DELETE_STORAGE_ACTION"
      :message="`本当にストレージプール「${targetForDeletion?.name}」を削除しますか？`"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { STORAGE } from "@/utils/constants";
import {
  useStorageManagement,
  type StoragePoolRow,
} from "~/composables/dashboard/useStorageManagement";
import { usePageActions } from "@/composables/usePageActions";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoStorageAdd from "~/components/MoStorageAdd.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";

/* データ取得 */
const {
  columns,
  headerButtons,
  rows,
  refresh,
} = useStorageManagement();

/* ページ共通アクション */
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<StoragePoolRow>({
  resourceName: STORAGE.name,
  resourceLabel: STORAGE.label,
  refresh,
});

const ADD_STORAGE_ACTION = `add-${STORAGE.name}`;
const EDIT_STORAGE_ACTION = `edit-${STORAGE.name}`;
const DELETE_STORAGE_ACTION = `delete-${STORAGE.name}`;

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "add") {
    openModal(ADD_STORAGE_ACTION);
  }
}

/* 行アクションのハンドラー（スナップショットと同じ形） */
function onRowAction({ action, row }: { action: string; row: StoragePoolRow }) {
  handleRowAction({ action, row });
}
</script>
