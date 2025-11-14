<template>
  <DashboardLayout
    title="インスタンスタイプ"
    :columns="columns"
    :rows="rawList"
    :headerButtons="headerButtons"
    @header-action="() => openModal(ADD_INSTANCE_TYPE_ACTION)"
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
    :show="activeModal === ADD_INSTANCE_TYPE_ACTION"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoInstanceTypeEdit
    :show="activeModal === EDIT_INSTANCE_TYPE_ACTION"
    :instance-type-data="targetForEditing"
    @close="closeModal"
    @success="handleSuccess"
  />
  <MoDeleteConfirm
    :show="activeModal === DELETE_INSTANCE_TYPE_ACTION"
    :message="`本当にインスタンスタイプ「${targetForDeletion?.name}」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { useInstanceTypeManagement } from "~/composables/dashboard/useInstanceTypeManagement";
import { usePageActions } from "~/composables/usePageActions";

const {
  columns,
  headerButtons,
  rawList,
  refresh,
  ADD_INSTANCE_TYPE_ACTION,
  EDIT_INSTANCE_TYPE_ACTION,
  DELETE_INSTANCE_TYPE_ACTION,
} = useInstanceTypeManagement();

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
} = usePageActions<InstanceTypeDTO>({
  resourceName: INSTANCE_TYPE.name,
  resourceLabel: INSTANCE_TYPE.label,
  refresh: refresh,
});
</script>
