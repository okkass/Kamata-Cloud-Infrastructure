<template>
  <DashboardLayout
    title="仮想ネットワーク"
    :columns="columns"
    :rows="rowsForTable"
    :row-key="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="handleRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink
        :to="`/virtual-network/${encodeURIComponent(String(row.id))}`"
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
      <NuxtLink
        v-if="row"
        :to="`/virtual-network/${encodeURIComponent(String(row.id))}`"
        class="action-item first:border-t-0"
      >
        詳細
      </NuxtLink>

      <button
        type="button"
        class="action-item"
        @click.stop.prevent="row && onEdit(row)"
      >
        編集
      </button>

      <button
        type="button"
        class="action-item action-item-danger"
        :disabled="isDeleting && targetForDeletion?.id === row?.id"
        @click.stop.prevent="row && onDelete(row)"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <MoVirtualNetworkCreate
    :show="activeModal === CREATE_NETWORK_ACTION"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <MoVirtualNetworkEdit
    :show="activeModal === EDIT_NETWORK_ACTION"
    :vnet="targetForEditing"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <MoDeleteConfirm
    :show="activeModal === DELETE_NETWORK_ACTION"
    :is-loading="isDeleting"
    :message="`本当に「${targetForDeletion?.name ?? ''}」を削除しますか？`"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoVirtualNetworkCreate from "@/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "@/components/MoVirtualNetworkEdit.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import {
  useVNetManagement,
  CREATE_NETWORK_ACTION,
  EDIT_NETWORK_ACTION,
  DELETE_NETWORK_ACTION,
} from "@/composables/useVNetManagement";
import { usePageActions } from "@/composables/usePageActions";
import { NETWORK } from "@/utils/constants";
import type { VNetRow } from "@/composables/useVNetManagement";

const { columns, headerButtons, rows, refresh } = useVNetManagement();
const rowsForTable = computed(() => rows.value ?? []);

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
  if (action === "add") {
    openModal(CREATE_NETWORK_ACTION);
  }
};

function onEdit(row: VNetRow) {
  if (!row) return;
  if (targetForEditing) targetForEditing.value = row;
  openModal?.(EDIT_NETWORK_ACTION);
}

function onDelete(row: VNetRow) {
  if (!row) return;
  if (targetForDeletion) targetForDeletion.value = row;
  openModal?.(DELETE_NETWORK_ACTION);
}
</script>
