<template>
  <div>
    <DashboardLayout
      :title="tableTitle"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink
          :to="`/network/${encodeURIComponent(String(row.id))}`"
          class="table-link"
        >
          {{ row.name }}
        </NuxtLink>
      </template>

      <template #cell-cidr="{ row }">
        <span class="font-mono">{{ row.cidr }}</span>
      </template>

      <template #cell-subnets="{ row }">
        <span class="font-mono">{{ row.subnets }}</span>
      </template>

      <template #cell-createdAtText="{ row }">
        <span>{{ row.createdAtText }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink v-if="row" :to="`/network/${row.id}`" class="action-item">
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
  </div>
  <MoVirtualNetworkCreate
    :show="activeModal === `create-${NETWORK.name}`"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <MoVirtualNetworkEdit
    :show="activeModal === `edit-${NETWORK.name}`"
    :data="targetForEditing?.originalData"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === `delete-${NETWORK.name}`"
    :is-loading="isDeleting"
    :message="`本当に「${targetForDeletion?.name ?? ''}」を削除しますか？`"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { NETWORK } from "@/utils/constants";
import {
  useVNetManagement,
  type VnetRow,
} from "~/composables/dashboard/useVNetManagement";
import { usePageActions } from "@/composables/usePageActions";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoVirtualNetworkCreate from "~/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "~/components/MoVirtualNetworkEdit.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";

/* データ取得 */
const {
  columns,
  headerButtons,
  rows,
  tableTitle,
  refresh,
  CREATE_VNET_ACTION,
  EDIT_VNET_ACTION,
  DELETE_VNET_ACTION,
} = useVNetManagement();

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
} = usePageActions<VnetRow>({
  resourceName: NETWORK.name,
  resourceLabel: NETWORK.label,
  refresh,
});

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "add") {
    openModal(CREATE_VNET_ACTION);
  }
}

/* 行アクションのハンドラー */
function onRowAction({ action, row }: { action: string; row: VnetRow }) {
  handleRowAction({ action, row });
}
</script>
