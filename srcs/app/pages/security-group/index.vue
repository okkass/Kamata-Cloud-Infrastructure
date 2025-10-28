<!-- srcs/app/pages/security_group_management/index.vue -->
<template>
  <div>
    <DashboardLayout
      title="セキュリティグループ"
      :columns="columns"
      :rows="groups || []"
      rowKey="id"
      :headerButtons="headerButtons"
      no-ellipsis
      @header-action="handleHeaderAction"
    >
      <!-- グループ名（リンク）＋説明 -->
      <template #cell-name="{ row }">
        <div v-if="row">
          <NuxtLink
            :to="`/security-group/${row.id}`"
            class="text-blue-600 hover:underline underline-offset-2 decoration-1"
          >
            {{ row.name }}
          </NuxtLink>
          <span
            v-if="row.description"
            class="block mt-0.5 text-sm text-gray-500"
          >
            {{ row.description }}
          </span>
        </div>
      </template>

      <!-- SG ID は等幅表示 -->
      <template #cell-id="{ row }">
        <span class="font-mono">{{ row.id }}</span>
      </template>

      <!-- ルール数（IN/OUT） -->
      <template #cell-rules="{ row }">
        <span class="font-mono">{{ row.inCount }} / {{ row.outCount }}</span>
      </template>

      <!-- 作成日 -->
      <template #cell-createdAt="{ row }">
        <span>{{ row.createdAt }}</span>
      </template>

      <!-- 行の操作（3点メニュー） -->
      <template #row-actions="{ row }">
        <NuxtLink
          :to="`/security-group/${row?.id}`"
          class="block w-full px-3 py-2 text-left border-t border-slate-200 hover:bg-slate-50"
        >
          詳細
        </NuxtLink>
        <button
          type="button"
          class="block w-full px-3 py-2 text-left border-t border-slate-200 hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-60 disabled:pointer-events-none"
          :disabled="deletingGroupId === row?.id"
          @click.stop.prevent="row && promptForDeletion(row)"
        >
          削除
        </button>
      </template>
    </DashboardLayout>
  </div>

  <!-- 削除確認モーダル（キーは複数形） -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-security-groups'"
    :message="`本当にセキュリティグループ「${
      targetForDeletion?.name ?? ''
    }」を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />

  <!-- 追加モーダル -->
  <MoSecurityGroupCreate
    :show="activeModal === 'add-security-group'"
    @close="closeModal"
    @success="notifySuccess"
  />
</template>

<script setup lang="ts">
import DashboardLayout from "~/components/DashboardLayout.vue";
import { useSecurityDashboard } from "~/composables/useSecurityDashboard";
import MoDeleteConfirm from "~/components/MoDeleteConfirm.vue";
import MoSecurityGroupCreate from "~/components/MoSecurityGroupCreate.vue";

const {
  columns,
  groups,
  headerButtons,

  activeModal,
  targetForDeletion,
  isDeleting,
  deletingGroupId,

  handleHeaderAction,
  promptForDeletion,
  cancelAction,
  handleDelete,
  closeModal,
  notifySuccess,
} = useSecurityDashboard();
</script>
