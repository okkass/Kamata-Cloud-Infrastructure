<template>
  <DashboardLayout
    :title="
      isManager
        ? '仮想マシン（全ユーザーの情報）'
        : '仮想マシン（自分のリソース）'
    "
    :columns="columns"
    :rows="rows"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleHeaderAction"
    @row-action="onRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/machine/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>

    <template #cell-instanceType="{ row }">
      <span class="text-sm">
        {{ row.specText }}
      </span>
    </template>

    <template #cell-storage="{ row }">
      <span class="font-mono text-sm"> {{ row.totalStorageGB }} GB </span>
    </template>
    <template #cell-node="{ row }">
      <span class="text-sm">{{ row.node.name }}</span>
    </template>
    <template #cell-status="{ row }">
      <span class="table-status" :class="getVmStatusDisplay(row.status).class">
        {{ getVmStatusDisplay(row.status).text }}
      </span>
    </template>
    <template #cell-createdAt="{ row }">
      <span class="text-sm font-mono">{{ formatDateTime(row.createdAt) }}</span>
    </template>
    <template #cell-cpu="{ row }">
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-mono">{{ row.cpuUsageText }}</span>
          <span class="text-slate-600">{{ row.cpuUtilizationPercent }}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-blue-500"
            :style="{ width: `${row.cpuUtilizationPercent}%` }"
          />
        </div>
      </div>
    </template>
    <template #cell-memory="{ row }">
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-mono">{{ row.memoryUsageText }}</span>
          <span class="text-slate-600"
            >{{ row.memoryUtilizationPercent }}%</span
          >
        </div>
        <div class="h-2 w-full rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-blue-500"
            :style="{ width: `${row.memoryUtilizationPercent}%` }"
          />
        </div>
      </div>
    </template>

    <template #row-actions="{ row, emit }">
      <NuxtLink
        v-if="row"
        :to="`/machine/${row.id}`"
        class="action-item first:border-t-0"
      >
        詳細
      </NuxtLink>
      <button
        type="button"
        class="action-item"
        @click.stop.prevent="row && handleRowAction({ action: 'edit', row })"
      >
        編集
      </button>
      <button
        type="button"
        class="action-item action-item-danger"
        :disabled="isDeleting && targetForDeletion?.id === row?.id"
        @click.stop.prevent="row && handleRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>
   
  <MoVirtualMachineCreate
    :show="activeModal === CREATE_VIRTUAL_MACHINE_ACTION"
    @close="cancelAction"
    @success="handleSuccess"
  />

   
  <MoVirtualMachineEdit
    :show="activeModal === EDIT_VIRTUAL_MACHINE_ACTION"
    :vmData="targetForEditing ?? null"
    @close="cancelAction"
    @success="handleSuccess"
  />

   
  <MoDeleteConfirm
    :show="activeModal === DELETE_VIRTUAL_MACHINE_ACTION"
    :is-loading="isDeleting"
    :resource-label="MACHINE.label"
    :resource-name="targetForDeletion?.name"
    :message="`本当に「${targetForDeletion?.name ?? ''}」を削除しますか？`"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { MACHINE } from "@/utils/constants";
import {
  useVMachineManagement,
  type VirtualMachineRow,
} from "~/composables/dashboard/useVMachineManagement";
import { usePageActions } from "~/composables/usePageActions";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";

/* データ取得 */
const {
  columns,
  headerButtons,
  rows,
  isManager,
  refresh,
  CREATE_VIRTUAL_MACHINE_ACTION,
  EDIT_VIRTUAL_MACHINE_ACTION,
  DELETE_VIRTUAL_MACHINE_ACTION,
} = useVMachineManagement();

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
} = usePageActions<VirtualMachineRow>({
  resourceName: MACHINE.name,
  resourceLabel: MACHINE.label,
  refresh,
});

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "create") {
    openModal(CREATE_VIRTUAL_MACHINE_ACTION);
  }
}

/* 行アクションのハンドラー */
function onRowAction({
  action,
  row,
}: {
  action: string;
  row: VirtualMachineRow;
}) {
  handleRowAction({ action, row });
}
</script>
