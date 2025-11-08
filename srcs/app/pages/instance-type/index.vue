<template>
  <DashboardLayout
    title="インスタンスタイプ"
    :columns="columns"
    :rows="rawList"
    :headerButtons="headerButtons"
    @header-action="() => openModal('add-instance-types')"
    @row-action="handleRowAction"
  >
    <template #cell-name="{ row }">
      <NuxtLink :to="`/instance-type/${row.id}`" class="table-link">
        {{ row.name }}
      </NuxtLink>
    </template>
    <template #cell-vcpu="{ row }">
      {{ row.cpuCore }}
    </template>
    <template #cell-memorySize="{ row }">
      {{ convertByteToUnit(row.memorySize, "MB") }} MB
    </template>

    <template #cell-createdAtText="{ row }">
      {{ formatDateTime(row.createdAt) }}
    </template>

    <template #row-actions="{ row }">
      <NuxtLink
        v-if="row"
        class="action-item first:border-t-0"
        :to="`/instance-type/${row.id}`"
      >
        詳細
      </NuxtLink>
      <button
        class="action-item"
        @click.stop.prevent="row && handleRowAction({ action: 'edit', row })"
      >
        編集
      </button>
      <button
        class="action-item action-item-danger"
        @click.stop.prevent="row && handleRowAction({ action: 'delete', row })"
      >
        削除
      </button>
    </template>
  </DashboardLayout>

  <MoInstanceTypeAdd
    :show="activeModal === 'add-instance-types'"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoInstanceTypeEdit
    :show="activeModal === 'edit-instance-types'"
    :instance-type-data="targetForEditing"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoDeleteConfirm
    :show="activeModal === 'delete-instance-types'"
    :message="`本当にインスタンスタイプ「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { useInstanceTypeManagement } from "~/composables/useInstanceTypeManagement";
import { usePageActions } from "~/composables/usePageActions";

const { columns, headerButtons, rawList, refresh } =
  useInstanceTypeManagement();

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
} = usePageActions<ModelInstanceTypeDTO>({
  resourceName: "instance-types",
  resourceLabel: "インスタンスタイプ",
  refresh: refresh,
});
</script>
