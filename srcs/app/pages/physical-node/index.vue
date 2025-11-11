<template>
  <div>
    <DashboardLayout
      title="ノード"
      :columns="columns"
      :rows="displayNodes"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleDashboardHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/physical-node/${row.id}`" class="table-link">
            {{ row.name }}
            <span v-if="row.isMgmt" class="cell-note">（管理ノード）</span>
          </NuxtLink>
        </div>
      </template>

      <template #cell-ip="{ row }">
        <span v-if="row" class="cell-mono">{{ row.ip }}</span>
      </template>

      <template #cell-status="{ row }">
        <span
          v-if="row"
          class="table-status"
          :class="getNodeStatusDisplay(row.status).class"
        >
          {{ getNodeStatusDisplay(row.status).text }}
        </span>
      </template>

      <template #row-actions="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/physical-node/${row.id}`" class="action-item">
            詳細
          </NuxtLink>
          <button
            type="button"
            class="action-item"
            :disabled="row.isMgmt || switchingNodeId === row.id"
            @click.stop.prevent="onRowAction({ action: 'set-mgmt', row })"
          >
            管理ノードに設定
          </button>
          <button
            type="button"
            class="action-item action-item-danger"
            :disabled="row.isMgmt"
            @click.stop.prevent="onRowAction({ action: 'delete', row })"
          >
            削除
          </button>
        </div>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === deletePhysicalNodeAction"
    :message="`本当にノード「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoAddNodeToCluster
    :show="activeModal === addPhysicalNodeAction"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 物理ノード管理ページ
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のロジックは `usePhysicalNodeManagement` Composable に分離されています。
 * =================================================================================
 */
import { usePhysicalNodeManagement } from "~/composables/usePhysicalNodeManagement";
import { usePageActions } from "~/composables/usePageActions";

// --- データロジック ---
const {
  columns,
  displayNodes,
  headerButtons,
  switchingNodeId,
  handleSetAsManagementNode,
  refreshNodeList,
} = usePhysicalNodeManagement();

// --- アクションロジック ---
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
} = usePageActions<UiNode>({
  resourceName: PHYSICAL_NODE.name,
  resourceLabel: PHYSICAL_NODE.label,
  refresh: refreshNodeList,
});

// --- イベントの振り分け ---
const handleDashboardHeaderAction = (action: string) => {
  if (action === "add") {
    openModal(addPhysicalNodeAction);
  }
};
const onRowAction = ({ action, row }: { action: string; row: UiNode }) => {
  if (action === "set-mgmt") {
    handleSetAsManagementNode(row.id);
  } else {
    handleRowAction({ action, row });
  }
};
</script>
