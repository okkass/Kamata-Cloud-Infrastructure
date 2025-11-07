<!-- app/pages/instance-type/index.vue -->
<template>
  <DashboardLayout
    title="インスタンスタイプ"
    :columns="columns"
    :rows="displayInstanceTypes"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="handleDashboardHeaderAction"
  >
    <!-- 名称 -->
    <template #cell-name="{ row }">
      <div v-if="row">
        <NuxtLink
          :to="`/instance-type/${encodeURIComponent(row.id)}`"
          class="table-link"
        >
          {{ row.name }}
        </NuxtLink>
        <div v-if="row.description" class="text-sm text-gray-500 mt-0.5">
          {{ row.description }}
        </div>
      </div>
    </template>

    <!-- vCPU -->
    <template #cell-vcpu="{ row }">
      <span v-if="row" class="font-mono">{{ row.vcpu }}</span>
    </template>

    <!-- メモリ（MB表示） -->
    <template #cell-memorySize="{ row }">
      <span v-if="row" class="font-mono">
        {{ convertByteToUnit(row.memorySize ?? 0, "MB") }} MB
      </span>
    </template>

    <!-- 作成日時 -->
    <template #cell-createdAtText="{ row }">
      <span v-if="row">{{ row.createdAtText }}</span>
    </template>

    <!-- 行アクション -->
    <template #row-actions="{ row }">
      <div v-if="row">
        <NuxtLink
          :to="`/instance-type/${encodeURIComponent(row.id)}`"
          class="action-item first:border-t-0"
        >
          詳細
        </NuxtLink>
        <button
          type="button"
          class="action-item w-full text-left"
          @click.stop.prevent="openEditModal(row)"
        >
          編集
        </button>
        <button
          type="button"
          class="action-item action-item-danger"
          :class="{ 'action-item-disabled': isDeletingId === row.id }"
          :disabled="isDeletingId === row.id"
          @click.stop.prevent="promptForDeletion(row)"
        >
          削除
        </button>
      </div>
    </template>
  </DashboardLayout>

  <Teleport to="body">
    <MoInstanceTypeAdd
      v-if="activeModal === 'add-instance-type'"
      :show="true"
      @close="closeModal"
      @success="handleAddSuccess"
    />
    <MoDeleteConfirm
      v-if="activeModal === 'delete-instance-type'"
      :show="true"
      :message="`本当にインスタンスタイプ「${targetForDeletion?.name}」を削除しますか？`"
      :is-loading="isDeleting"
      @close="cancelAction"
      @confirm="handleDelete"
    />
    <MoInstanceTypeEdit
      v-if="activeModal === 'edit-instance-type'"
      :show="true"
      :instanceTypeData="editingPayload"
      @close="closeModal"
      @success="handleEditSuccess"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { convertByteToUnit } from "~/utils/format";
import MoInstanceTypeAdd from "~/components/MoInstanceTypeAdd.vue";
import MoInstanceTypeEdit from "~/components/MoInstanceTypeEdit.vue";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";
import { useInstanceTypeManagement } from "~/composables/useInstanceTypeManagement";

const {
  columns,
  headerButtons,
  displayInstanceTypes,
  activeModal,
  targetForDeletion,
  editingTarget,
  isDeleting,
  isDeletingId,
  handleDashboardHeaderAction,
  openEditModal,
  promptForDeletion,
  cancelAction,
  handleDelete,
  closeModal,
  handleAddSuccess,
  handleEditSuccess,
} = useInstanceTypeManagement();

// 編集モーダルに渡す payload（MB単位）
const editingPayload = computed(() =>
  editingTarget.value
    ? {
        id: editingTarget.value.id,
        name: editingTarget.value.name,
        cpuCore: editingTarget.value.vcpu,
        memorySizeMb: convertByteToUnit(
          editingTarget.value.memorySize ?? 0,
          "MB"
        ),
      }
    : null
);
</script>
