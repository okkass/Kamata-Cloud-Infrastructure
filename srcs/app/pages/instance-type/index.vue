<template>
  <div>
    <DashboardLayout
      title="インスタンスタイプ"
      :columns="columns"
      :rows="rows"
      rowKey="id"
      :headerButtons="headerButtons"
      @header-action="handleHeaderAction"
      @row-action="handleRowAction"
    >
      <template #cell-name="{ row }">
        <NuxtLink
          :to="`/instance-type/${encodeURIComponent(String(row.id))}`"
          class="table-link"
        >
          {{ row.name }}
        </NuxtLink>
      </template>

      <template #cell-vcpu="{ row }">
        <span class="font-mono">{{ row.vcpu }}</span>
      </template>

      <template #cell-memorySize="{ row }">
        <span class="font-mono">{{ row.memorySize }} MB</span>
      </template>

      <template #cell-createdAtText="{ row }">
        <span>{{ row.createdAtText }}</span>
      </template>

      <template #row-actions="{ row }">
        <NuxtLink
          v-if="row"
          :to="`/instance-type/${encodeURIComponent(String(row.id))}`"
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

    <!-- インスタンスタイプ追加モーダル -->
    <MoInstanceTypeAdd
      :show="activeModal === ADD_INSTANCE_TYPE_ACTION"
      @close="cancelAction"
      @success="handleSuccess"
    />

    <!-- インスタンスタイプ編集モーダル -->
    <MoInstanceTypeEdit
      :show="activeModal === EDIT_INSTANCE_TYPE_ACTION"
      :data="targetForEditing?.originalData ?? undefined"
      @close="cancelAction"
      @success="handleSuccess"
    />

    <!-- 削除確認モーダル -->
    <MoDeleteConfirm
      :show="activeModal === DELETE_INSTANCE_TYPE_ACTION"
      :message="deleteMessage"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { INSTANCE_TYPE } from "~/utils/constants";
import {
  useInstanceTypeManagement,
  type InstanceTypeRow,
} from "~/composables/dashboard/useInstanceTypeManagement";
import { usePageActions } from "~/composables/usePageActions";
import DashboardLayout from "~/components/DashboardLayout.vue";
import MoInstanceTypeAdd from "~/components/MoInstanceTypeAdd.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";

/* データ取得 */
const {
  columns,
  headerButtons,
  rows,
  refresh,
  ADD_INSTANCE_TYPE_ACTION,
  EDIT_INSTANCE_TYPE_ACTION,
  DELETE_INSTANCE_TYPE_ACTION,
} = useInstanceTypeManagement();

/* ページ共通アクション */
const {
  activeModal,
  openModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleSuccess,
  cancelAction,
} = usePageActions<InstanceTypeRow>({
  resourceName: INSTANCE_TYPE.name,
  resourceLabel: INSTANCE_TYPE.label,
  refresh,
});

/* ヘッダーボタンのハンドラー */
function handleHeaderAction(action: string) {
  if (action === "add") {
    openModal(ADD_INSTANCE_TYPE_ACTION);
  }
}

/* 削除確認メッセージ（XSS対策） */
const deleteMessage = computed(() => {
  const name = targetForDeletion.value?.name ?? "";
  return `本当にインスタンスタイプ「${name}」を削除しますか？`;
});
</script>
