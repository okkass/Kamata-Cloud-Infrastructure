<template>
  <div>
    <DashboardLayout
      title="仮想マシンイメージ"
      :columns="columns"
      :rows="displayImages"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleDashboardHeaderAction"
    >
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink :to="`/images/${row.id}`" class="table-link">
            {{ row.name }}
            <span
              v-if="row.description"
              class="text-sm text-gray-500 block mt-0.5"
            >
              {{ row.description }}
            </span>
          </NuxtLink>
        </div>
      </template>

      <template #cell-size="{ row }">
        <span v-if="row" class="font-mono">{{ row.size }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span v-if="row">{{ row.createdAt }}</span>
      </template>

      <template #row-actions="{ row }">
        <div v-if="row">
          <NuxtLink
            :to="`/images/${row.id}`"
            class="action-item first:border-t-0"
            >詳細</NuxtLink
          >
          <button
            type="button"
            class="action-item action-item-danger"
            :class="{ 'action-item-disabled': deletingImageId === row.id }"
            :disabled="deletingImageId === row.id"
            @click.stop.prevent="promptForImageDeletion(row)"
          >
            削除
          </button>
        </div>
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
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { useImageManagement } from "~/composables/useImageManagement";

const {
  columns,
  displayImages,
  headerButtons,
  activeModal,
  targetForDeletion,
  isDeleting,
  deletingImageId,
  handleDashboardHeaderAction,
  promptForImageDeletion,
  cancelAction,
  handleDelete,
  closeModal,
  handleSuccess,
} = useImageManagement();
</script>

<style scoped>
.table-link {
  @apply font-semibold hover:underline;
}
.action-item {
  @apply block w-full text-left px-4 py-3 text-[15px] font-semibold hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200;
}
.action-item-danger {
  @apply text-red-600 hover:bg-[#fff1f1];
}
.action-item-disabled {
  @apply opacity-60 pointer-events-none;
}
</style>
