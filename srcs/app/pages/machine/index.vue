<template>
  <DashboardLayout
    title="仮想マシンダッシュボード"
    :columns="columns"
    :rows="rowsForTable"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="handleRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/machine/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>

    <template #cell-instanceType="{ row }">
      <span class="text-sm">
        {{ formatVmSpec(row) }}
      </span>
    </template>

    <template #cell-storage="{ row }">
      <span class="font-mono text-sm">
        {{ calculateTotalStorage(row.attachedStorages) }} GB
      </span>
    </template>
    <template #cell-node="{ row }">
      <span class="text-sm">{{ row.node.name }}</span>
    </template>
    <template #cell-status="{ row }">
      <span
        class="inline-flex select-none items-center rounded-md px-2 py-0.5 text-xs font-bold"
        :class="getVmStatusDisplay(row.status).class"
      >
        {{ getVmStatusDisplay(row.status).text }}
      </span>
    </template>
    <template #cell-createdAt="{ row }">
      <span class="text-sm font-mono">{{ formatDateTime(row.createdAt) }}</span>
    </template>

    <template #row-actions="{ row, emit }">
      <NuxtLink
        v-if="row"
        :to="`/machine/${row.id}`"
        class="action-item first:border-t-0"
      >
        詳細
      </NuxtLink>
      <a href="#" class="action-item" @click.prevent="emit('edit')"> 編集 </a>
      <a
        href="#"
        class="action-item action-item-danger"
        @click.prevent="emit('delete')"
      >
        削除
      </a>
    </template>
  </DashboardLayout>
   
  <MoVirtualMachineCreate
    :show="activeModal === `create-${RESOURCE_NAME}`"
    @close="cancelAction"
    @success="handleSuccess"
  />

   
  <MoVirtualMachineEdit
    :show="activeModal === `edit-${RESOURCE_NAME}`"
    :virtual-machine="targetForEditing"
    @close="cancelAction"
    @success="handleSuccess"
  />

   
  <MoDeleteConfirm
    :show="activeModal === `delete-${RESOURCE_NAME}`"
    :is-loading="isDeleting"
    :resource-label="resourceLabel"
    :resource-name="targetForDeletion?.name"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

// ==============================================================================
// 定数定義 (Constants)
// ==============================================================================
const RESOURCE_NAME = "virtual-machines";
const resourceLabel = "仮想マシン";

// ==============================================================================
// 状態管理 (State Management via Composables)
// ==============================================================================
const { data: virtualMachines, refresh } =
  useResourceList<VirtualMachineDTO>(RESOURCE_NAME);

const rowsForTable = computed<VirtualMachineDTO[]>(
  () => virtualMachines.value ?? []
);

const {
  activeModal,
  openModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<VirtualMachineDTO>({
  resourceName: RESOURCE_NAME,
  resourceLabel,
  refresh,
});

/**
 * テーブルのカラム定義。
 */
const columns = [
  { key: "name", label: "仮想マシン名" },
  { key: "instanceType", label: "スペック (CPU/メモリ)" },
  { key: "storage", label: "ストレージ" },
  { key: "node", label: "配置ノード" },
  { key: "status", label: "状態" },
  { key: "createdAt", label: "作成日時" },
];

/**
 * ヘッダーに表示するボタンの定義。
 */
const headerButtons = [{ label: "新規作成", action: "create" }];

// ==============================================================================
// イベントハンドラ (Event Handlers)
// ==============================================================================
const onHeaderAction = (action: string) => {
  if (action === "create") {
    openModal(`create-${RESOURCE_NAME}`);
  }
};
</script>
