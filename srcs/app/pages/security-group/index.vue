<template>
  <div>
    <DashboardLayout
      title="セキュリティグループ"
      :columns="columns"
      :rows="groups || []"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="() => openModal('add-security-groups')"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/security-group/${row.id}`" class="table-link">
            {{ row.name }}
          </NuxtLink>
          <span v-if="row.description" class="cell-description">
            {{ row.description }}
          </span>
        </div>
      </template>
      <template #row-actions="{ row }">
        <NuxtLink :to="`/security-group/${row?.id}`" class="action-item">
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
    :show="activeModal === 'delete-security-groups'"
    :message="`本当に「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoSecurityGroupCreate
    :show="activeModal === 'add-security-groups'"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoSecurityGroupEdit
    :show="activeModal === 'edit-security-groups'"
    :group="targetForEditing"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { useSecurityDashboard } from "~/composables/useSecurityDashboard";
import { usePageActions } from "~/composables/usePageActions";

// ★ 1. データ関連のComposableを呼び出し
const { columns, groups, headerButtons, refreshGroupList } =
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
} = usePageActions<SecurityGroupDTO>({
  resourceName: "security-groups",
  resourceLabel: "セキュリティグループ",
  refresh: refreshGroupList, // refresh関数を渡す
});
</script>
