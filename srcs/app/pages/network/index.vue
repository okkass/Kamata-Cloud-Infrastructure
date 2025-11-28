<template>
  <DashboardLayout
    title="仮想ネットワーク"
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <!-- 仮想ネットワーク名 -->
    <template #cell-name="{ row }">
      <NuxtLink :to="`/network/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>

    <!-- CIDR -->
    <template #cell-cidr="{ row }">
      <span class="font-mono">{{ row.cidr }}</span>
    </template>

    <!-- サブネット数 -->
    <template #cell-subnets="{ row }">
      <span class="font-mono">{{ row.subnets }}</span>
    </template>

    <!-- 作成日時 -->
    <template #cell-createdAtText="{ row }">
      <span>{{ row.createdAtText }}</span>
    </template>

    <!-- 三点リーダー（詳細 / 編集 / 削除） -->
    <template #row-actions="{ row }">
      <div v-if="row">
        <NuxtLink
          :to="`/network/${row.id}`"
          class="action-item first:border-t-0"
        >
          詳細
        </NuxtLink>
        <button
          class="action-item"
          @click.stop.prevent="onRowAction({ action: EDIT_VNET_ACTION, row })"
        >
          編集
        </button>
        <button
          class="action-item action-item-danger"
          :disabled="isDeleting && targetForDeletion?.id === row.id"
          @click.stop.prevent="onRowAction({ action: DELETE_VNET_ACTION, row })"
        >
          削除
        </button>
      </div>
    </template>
  </DashboardLayout>

  <!-- 作成モーダル：showCreate が true のときに開く -->
  <MoVirtualNetworkCreate
    :show="activeModal === CREATE_VNET_ACTION"
    @close="closeModal"
    @success="handleSuccess"
  />

  <!-- 削除確認モーダル（usePageActions が管理する場合は activeModal で制御） -->
  <MoDeleteConfirm
    :show="activeModal === DELETE_VNET_ACTION"
    :message="`本当に仮想ネットワーク「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoVirtualMachineEdit
    :show="activeModal === EDIT_VNET_ACTION"
    :vnet="targetForEditing"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoVirtualNetworkCreate from "@/components/MoVirtualNetworkCreate.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import {
  useVNetManagement,
  type VNetRow,
} from "@/composables/useVNetManagement";
import { usePageActions } from "@/composables/usePageActions";

const {
  columns,
  headerButtons,
  rows,
  refresh,
  CREATE_VNET_ACTION,
  DELETE_VNET_ACTION,
  EDIT_VNET_ACTION,
} = useVNetManagement();

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
} = usePageActions<VNetRow>({
  resourceName: NETWORK.name,
  resourceLabel: NETWORK.label,
  refresh,
});

const onHeaderAction = (action: string) => {
  if (action === CREATE_VNET_ACTION) {
    openModal(CREATE_VNET_ACTION);
  }
};

const onRowAction = ({ action, row }: { action: string; row: VNetRow }) => {
  if (!row) return;
  if (action === DELETE_VNET_ACTION) {
    targetForDeletion.value = row;
    openModal(DELETE_VNET_ACTION);
    return;
  }
  if (action === EDIT_VNET_ACTION) {
    targetForEditing.value = row;
    openModal(EDIT_VNET_ACTION);
    return;
  }
  handleRowAction({ action, row });
};
</script>
