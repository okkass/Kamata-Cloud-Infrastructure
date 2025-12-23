<template>
  <div>
    <DashboardLayout
      title="仮想マシンイメージ"
      :columns="columns"
      :rows="images"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
      @row-action="onRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink :to="`/image/${row.id}`" class="table-link">
          {{ row.name }}
          <span v-if="row.description" class="cell-description">
            {{ row.description }}
          </span>
        </NuxtLink>
      </template>

      <template #cell-size="{ row }">
        <span class="cell-mono">{{ row.size }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span>{{ row.createdAt }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink :to="`/image/${row?.id}`" class="action-item">詳細</NuxtLink>

        <button
          type="button"
          class="action-item"
          @click.stop.prevent="row && onRowAction({ action: 'edit', row })"
        >
          編集
        </button>

        <button
          type="button"
          class="action-item action-item-danger"
          :disabled="isDeleting && targetForDeletion?.id === row?.id"
          @click.stop.prevent="row && onRowAction({ action: 'delete', row })"
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
      @close="closeModal"
      @success="handleSuccess"
    />
    <MoImageEdit
      :show="activeModal === EDIT_IMAGE_ACTION"
      :image-data="targetForEditing ?? undefined"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useImageManagement } from "~/composables/dashboard/useImageManagement";
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
} = usePageActions<ImageResponse>({
  resourceName: "image",
  resourceLabel: "イメージ",
  refresh,
});

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "add") {
    openModal(ADD_IMAGE_ACTION);
  }
}

/* 行アクションのハンドラー */
function onRowAction({ action, row }: { action: string; row: any }) {
  const imageRow: ImageResponse = {
    ...row,
    size: typeof row.size === "string" ? Number(row.size) : row.size,
  };
  handleRowAction({ action, row: imageRow });
}
</script>
