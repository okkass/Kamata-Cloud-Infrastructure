<template>
  <div>
    <DashboardLayout
      title="仮想マシンイメージ"
      :columns="columns"
      :rows="images"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/image/${row.id}`" class="table-link">
          {{ row.name }}
          <span
            v-if="row.description"
            class="block mt-0.5 text-sm text-gray-500"
          >
            {{ row.description }}
          </span>
        </NuxtLink>
      </template>

      <template #cell-size="{ row }">
        <span class="font-mono">{{ row.size }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span>{{ row.createdAt }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink :to="`/image/${row?.id}`" class="action-item first:border-t-0"
          >詳細</NuxtLink
        >
        <button
          type="button"
          class="action-item action-item-danger"
          :class="{ 'action-item-disabled': deletingImageId === row?.id }"
          :disabled="deletingImageId === row?.id"
          @click.stop.prevent="row && promptForDeletion(row)"
        >
          削除
        </button>
      </template>
    </DashboardLayout>
  </div>

  <MoDeleteConfirm
    :show="activeModal === 'delete-images'"
    :message="`本当にイメージ「${
      targetForDeletion?.name ?? ''
    }」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />

  <MoImageAdd
    :show="activeModal === 'add-image'"
    @close="closeModal"
    @success="notifySuccess"
  />
</template>

<script setup lang="ts">
import { useImageManagement } from "~/composables/useImageManagement";

// Composableからページに必要なロジックと状態をすべて受け取る
const {
  columns,
  images,
  headerButtons,
  activeModal,
  targetForDeletion,
  isDeleting,
  deletingImageId,
  handleHeaderAction,
  promptForDeletion,
  cancelAction,
  handleDelete,
  closeModal,
  notifySuccess,
} = useImageManagement();
</script>
