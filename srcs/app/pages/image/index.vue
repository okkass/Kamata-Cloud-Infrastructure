<template>
  <div>
    <DashboardLayout
      title="仮想マシンイメージ"
      :columns="columns"
      :rows="images"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="() => openModal(ADD_IMAGE_ACTION)"
      @row-action="handleRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink
          :to="`/image/${encodeURIComponent(String(row.id))}`"
          class="table-link"
        >
          {{ row.name }}
        </NuxtLink>
      </template>

      <template #cell-size="{ row }">
        <span class="cell-mono">{{ row.size }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span>{{ row.createdAt }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink
          :to="`/image/${encodeURIComponent(String(row?.id))}`"
          class="action-item"
          >詳細</NuxtLink
        >

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
          @click.stop.prevent="
            row && handleRowAction({ action: 'delete', row })
          "
        >
          削除
        </button>
      </template>
    </DashboardLayout>

    <MoDeleteConfirm
      :show="activeModal === DELETE_IMAGE_ACTION"
      :message="`本当にイメージ「${targetForDeletion?.name}」を削除しますか？`"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />
    <MoImageAdd
      :show="activeModal === ADD_IMAGE_ACTION"
      @close="cancelAction"
      @success="handleSuccess"
    />
    <MoImageEdit
      :show="activeModal === EDIT_IMAGE_ACTION"
      :data="targetForEditing?.originalData ?? undefined"
      @close="cancelAction"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {
  useImageManagement,
  type ImageRow,
} from "~/composables/dashboard/useImageManagement";
import { IMAGE } from "~/utils/constants";
import { usePageActions } from "~/composables/usePageActions";

// --- データロジックの取得 ---
const {
  columns,
  images,
  headerButtons,
  refresh,
  ADD_IMAGE_ACTION,
  EDIT_IMAGE_ACTION,
  DELETE_IMAGE_ACTION,
} = useImageManagement();

// --- アクションロジックの取得 ---
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
} = usePageActions<ImageRow>({
  resourceName: IMAGE.name,
  resourceLabel: "イメージ",
  refresh,
});
</script>
