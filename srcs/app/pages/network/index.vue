<template>
  <DashboardLayout
    title="仮想ネットワーク"
    :columns="columns"
    :rows="rowsForTable"
    :rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="handleRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink
        :to="`network/${encodeURIComponent(String(row.id))}`"
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
        :to="`/network/${encodeURIComponent(String(row.id))}`"
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
    :show="activeModal === `create-${NETWORK.name}`"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <MoVirtualNetworkEdit
    :show="activeModal === `edit-${NETWORK.name}`"
    :vnet="targetForEditing"
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
import type { VirtualNetworkDTO } from "~~/shared/types/dto/virtual-network"; // DTO は共有型を使う
import { computed } from "vue";
import DashboardLayout from "@/components/DashboardLayout.vue";
import MoVirtualNetworkCreate from "@/components/MoVirtualNetworkCreate.vue";
import MoVirtualNetworkEdit from "@/components/MoVirtualNetworkEdit.vue";
import MoDeleteConfirm from "@/components/MoDeleteConfirm.vue";
import { useVNetManagement } from "~/composables/dashboard/useVNetManagement";
import { usePageActions } from "@/composables/usePageActions";
import { NETWORK } from "@/utils/constants";

const { columns, headerButtons, rows, refresh } = useVNetManagement();
const rowsForTable = computed(() => rows.value ?? []);

/* ここでジェネリクスに VNetRow を渡す */
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
    openModal?.(`create-${NETWORK.name}`);
  }
};

function onEdit(row: VNetRow) {
  if (!row) return;
  // usePageActions 側で target 設定とモーダル名を統一して開く
  handleRowAction({ action: "edit", row });
}

function onDelete(row: VNetRow) {
  if (!row) return;
  // usePageActions 側で target 設定とモーダル名を統一して開く
  handleRowAction({ action: "delete", row });
}
</script>
