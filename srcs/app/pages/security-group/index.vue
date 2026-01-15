<template>
  <div>
    <DashboardLayout
      :title="
        isManager
          ? 'セキュリティグループ（全ユーザーの情報）'
          : 'セキュリティグループ（自分のリソース）'
      "
      :columns="columns"
      :rows="groups || []"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="() => openModal(addSecurityGroupAction)"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink
            :to="`/security-group/${encodeURIComponent(String(row.id))}`"
            class="table-link"
          >
            {{ row.name }}
          </NuxtLink>
        </div>
      </template>
      <template #row-actions="{ row }">
        <NuxtLink
          :to="`/security-group/${encodeURIComponent(String(row?.id))}`"
          class="action-item"
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
          @click.stop.prevent="
            row && handleRowAction({ action: 'delete', row })
          "
        >
          削除
        </button>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === deleteSecurityGroupAction"
    :message="`本当に「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoSecurityGroupCreate
    :show="activeModal === addSecurityGroupAction"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoSecurityGroupEdit
    :show="activeModal === editSecurityGroupAction"
    :data="targetForEditing?.originalData ?? null"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { SECURITY_GROUP } from "@/utils/constants";
import { useSecurityDashboard } from "~/composables/dashboard/useSecurityManagement";
import { usePageActions } from "~/composables/usePageActions";
import type { UiEnhancedSecurityGroup } from "~/composables/dashboard/useSecurityManagement";

// ★ 1. データ関連のComposableを呼び出し
const { columns, groups, isManager, headerButtons, refreshGroupList } =
  useSecurityDashboard();

// ★ 2. アクション関連のComposableを呼び出し
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  targetForEditing, // targetForEditingを受け取る
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<UiEnhancedSecurityGroup>({
  resourceName: SECURITY_GROUP.name,
  resourceLabel: SECURITY_GROUP.label,
  refresh: async () => {
    await refreshGroupList();
  }, // refresh関数を渡す
});

const addSecurityGroupAction = `create-${SECURITY_GROUP.name}`;
const editSecurityGroupAction = `edit-${SECURITY_GROUP.name}`;
const deleteSecurityGroupAction = `delete-${SECURITY_GROUP.name}`;
</script>
