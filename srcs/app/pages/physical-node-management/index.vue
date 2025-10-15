<template>
  <div>
    <DashboardLayout
      title="物理ノード管理"
      :columns="columns"
      :rows="displayNodes"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleDashboardHeaderAction"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/physical-node/${row.id}`" class="table-link">
            {{ row.name }}
            <span v-if="row.isMgmt" class="text-sm text-gray-500"
              >（管理ノード）</span
            >
          </NuxtLink>
        </div>
      </template>

      <template #cell-ip="{ row }">
        <span v-if="row" class="font-mono">{{ row.ip }}</span>
      </template>

      <template #row-actions="{ row }">
        <div v-if="row" class="flex items-center justify-end">
          <NuxtLink :to="`/physical-node/${row.id}`" class="action-item">
            詳細
          </NuxtLink>
          <button
            type="button"
            class="action-item"
            :class="{
              'action-item-disabled': row.isMgmt || switchingNodeId === row.id,
            }"
            :disabled="row.isMgmt || switchingNodeId === row.id"
            @click.stop.prevent="handleSetAsManagementNode(row.id)"
          >
            管理ノードに設定
          </button>
          <button
            type="button"
            class="action-item action-item-danger"
            :class="{ 'action-item-disabled': row.isMgmt }"
            :disabled="row.isMgmt"
            @click.stop.prevent="promptForNodeDeletion(row)"
          >
            削除
          </button>
        </div>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === 'delete-physical-nodes'"
    :message="`本当にノード「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoAddNodeToCluster
    :show="activeModal === 'add-physical-node'"
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

// --- Composableからページ全体のロジックを取得 ---
const {
  columns,
  displayNodes,
  headerButtons,
  activeModal,
  targetForDeletion,
  isDeleting,
  switchingNodeId,
  handleDashboardHeaderAction,
  handleSetAsManagementNode,
  promptForNodeDeletion,
  cancelAction,
  handleDelete,
  closeModal,
  handleSuccess,
} = usePhysicalNodeManagement();
</script>
