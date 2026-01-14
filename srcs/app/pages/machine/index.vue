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
    :key="activeModal || confirmDialog.show ? 'modal-open' : 'modal-closed'"
    @header-action="handleHeaderAction"
    @row-action="onRowAction"
  >
    <template #header-actions>
      <div class="flex gap-2 items-center">
        <button class="btn btn-primary" @click="handleHeaderAction('create')">
          新規作成
        </button>
        <div class="relative action-menu-container">
          <button
            class="btn btn-sm btn-secondary flex items-center gap-2"
            @click="toggleActionMenu"
          >
            操作
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            v-if="showActionMenu"
            class="absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-lg shadow-xl z-50"
          >
            <div
              v-for="(action, index) in bulkActions"
              :key="action.value"
              class="relative group"
            >
              <button
                class="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                :class="{
                  'first:rounded-t-lg': index === 0,
                  'last:rounded-b-lg': index === bulkActions.length - 1,
                }"
                :disabled="selectedVmIds.length === 0"
                @click="handleBulkActionClick(action.value)"
              >
                {{ action.label }}
              </button>
              <!-- ツールチップ -->
              <div
                v-if="selectedVmIds.length === 0"
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50"
              >
                VMにチェックを入れてください
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #cell-checkbox="{ row }">
      <input
        type="checkbox"
        :checked="selectedVmIds.includes(row.id)"
        @change="toggleVmSelection(row.id)"
        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
    </template>

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

    <template #row-actions="{ row }">
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

  <!-- VM操作の確認ダイアログ -->
  <ConfirmationModal
    :show="confirmDialog.show"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    :confirm-text="confirmDialog.confirmText"
    @confirm="executeConfirmedVmAction"
    @cancel="closeConfirmDialog"
  />

  <!-- アラートモーダル -->
  <ConfirmationModal
    :show="alertDialog.show"
    :title="alertDialog.title"
    :message="alertDialog.message"
    confirm-text="了解"
    @confirm="closeAlertDialog"
    @cancel="closeAlertDialog"
  />
</template>

<script setup lang="ts">
import { MACHINE } from "@/utils/constants";
import {
  useVMachineManagement,
  type VirtualMachineRow,
} from "~/composables/dashboard/useVMachineManagement";
import { usePageActions } from "~/composables/usePageActions";
import { useVMBulkOperations } from "~/composables/dashboard/useVMBulkOperations";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoVirtualMachineCreate from "~/components/MoVirtualMachineCreate.vue";
import MoVirtualMachineEdit from "~/components/MoVirtualMachineEdit.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";
import ConfirmationModal from "~/components/ConfirmationModal.vue";

/* データ取得 */
const {
  columns: originalColumns,
  headerButtons,
  rows,
  isManager,
  refresh,
  CREATE_VIRTUAL_MACHINE_ACTION,
  EDIT_VIRTUAL_MACHINE_ACTION,
  DELETE_VIRTUAL_MACHINE_ACTION,
} = useVMachineManagement();

// チェックボックス列を追加
const columns = [
  { key: "checkbox", label: "", align: "center" as const },
  ...originalColumns,
];

/* VM一括操作管理（チェックボックス選択 + VM操作） */
const {
  selectedVmIds,
  showActionMenu,
  toggleVmSelection,
  clearSelection,
  toggleActionMenu,
  closeActionMenu,
  confirmDialog,
  alertDialog,
  confirmationConfig,
  closeConfirmDialog,
  closeAlertDialog,
  executeVmAction,
  executeBulkVmAction,
  showBulkActionConfirm,
  showAlert,
} = useVMBulkOperations();

// 一括操作メニュー定義
const bulkActions = [
  { label: "起動", value: "start" },
  { label: "停止", value: "stop" },
  { label: "シャットダウン", value: "shutdown" },
  { label: "再起動", value: "reboot" },
  { label: "リセット", value: "reset" },
];

/**
 * 一括操作ボタンクリック時の処理
 */
const handleBulkActionClick = (action: string) => {
  if (selectedVmIds.value.length === 0) {
    showAlert("入力値が不足しています", "VMにチェックを入れてください");
    return;
  }
  closeActionMenu();
  handleBulkAction(action);
};

/**
 * 一括操作の処理
 */
const handleBulkAction = (action: string) => {
  const selectedVms = rows.value.filter((vm) =>
    selectedVmIds.value.includes(vm.id)
  );
  const vmNames = selectedVms.map((vm) => vm.name);

  // 確認が必要なアクション
  if (confirmationConfig[action as keyof typeof confirmationConfig]) {
    showBulkActionConfirm(action, vmNames, selectedVmIds.value.length);
    return;
  }

  // 確認不要なアクション（起動）は直接実行
  executeBulkAction(action);
};

/**
 * 確認済みVM操作を実行
 */
const executeConfirmedVmAction = async () => {
  const actionValue = confirmDialog.value.actionValue;
  const vmId = confirmDialog.value.vmId;
  closeConfirmDialog();

  if (!actionValue) return;

  // 一括操作の場合
  if (!vmId && selectedVmIds.value.length > 0) {
    await executeBulkAction(actionValue);
    return;
  }

  // 単一操作の場合（詳細画面からの操作用に残す）
  if (vmId) {
    await executeVmAction(vmId, actionValue);
    await refresh();
  }
};

/**
 * 一括VM操作を実行
 */
const executeBulkAction = async (actionValue: string) => {
  const vmIds = [...selectedVmIds.value];
  await executeBulkVmAction(vmIds, actionValue);
  clearSelection();
  await refresh();
};

/* ページ共通アクション */
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
} = usePageActions<VirtualMachineRow>({
  resourceName: MACHINE.name,
  resourceLabel: MACHINE.label,
  refresh,
});

/**
 * ヘッダーボタンのハンドラー
 */
function handleHeaderAction(action: string) {
  if (action === "create") {
    openModal(CREATE_VIRTUAL_MACHINE_ACTION);
  }
}

/**
 * 行アクションのハンドラー
 */
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
