<template>
  <DashboardLayout
    title="セキュリティグループ"
    :columns="columns"
    :rows="securityGroups"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="handleRowAction"
  >
    <!-- グループ名をクリックで詳細ページへ遷移 -->
    <template #cell-name="{ row }">
      <NuxtLink
        :to="`/security-group/${row.id}`"
        class="text-sky-600 hover:text-sky-800 hover:underline font-semibold"
      >
        {{ row.name }}
      </NuxtLink>
    </template>

    <!-- In/Outルール数を表示 -->
    <template #cell-in-out-count="{ row }">
      <div class="flex items-center justify-center gap-2 text-sm">
        <span class="font-semibold">In:</span>
        <span
          class="inline-block text-center font-bold text-sky-800 bg-sky-100 rounded-full px-2.5 py-0.5"
        >
          {{ getRuleCount(row.rules, "inbound") }}
        </span>
        <span class="font-semibold ml-2">Out:</span>
        <span
          class="inline-block text-center font-bold text-indigo-800 bg-indigo-100 rounded-full px-2.5 py-0.5"
        >
          {{ getRuleCount(row.rules, "outbound") }}
        </span>
      </div>
    </template>

    <!-- 操作メニュー -->
    <template #row-actions="{ row, emit }">
      <NuxtLink
        :to="`/security-group/${row.id}`"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t first:border-t-0 border-slate-200"
      >
        詳細
      </NuxtLink>
      <a
        href="#"
        class="block px-4 py-3 text-[15px] font-semibold text-slate-900 hover:bg-[#f5f7fa] border-t border-slate-200"
        @click.prevent="emit('edit')"
      >
        編集
      </a>
      <a
        href="#"
        class="block px-4 py-3 text-[15px] font-semibold text-red-600 hover:bg-red-50 border-t border-slate-200"
        @click.prevent="emit('delete')"
      >
        削除
      </a>
    </template>
  </DashboardLayout>

  <!-- モーダルのイベントハンドラをComposableから受け取った関数に差し替え -->
  <MoDeleteConfirm
    :show="activeModal === 'delete-security-groups'"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />
  <MoSecurityGroupEdit
    :show="activeModal === 'edit-security-groups'"
    :security-group-data="targetForEditing"
    @close="cancelAction"
    @success="handleEditSuccess"
  />
  <MoSecurityGroupCreate
    :show="activeModal === 'create-security-groups'"
    @close="closeModal"
    @success="handleCreateSuccess"
  />
</template>

<script setup lang="ts">
// --- Composables Setup ---
const { data: securityGroups, refresh } =
  useResourceList<SecurityGroupDTO>("security-groups");

// ★ 新しいComposableを呼び出し、必要なstateと関数を受け取る
const {
  activeModal,
  openModal,
  closeModal,
  targetForDeletion,
  targetForEditing,
  isDeleting,
  handleRowAction,
  handleDelete,
  handleCreateSuccess,
  handleEditSuccess,
  cancelAction,
} = useDashboardActions<SecurityGroupDTO>({
  resourceName: "security-groups",
  resourceLabel: "セキュリティグループ",
  refresh,
});

// --- UI Configuration ---
const columns = [
  { key: "name", label: "グループ名" },
  { key: "description", label: "説明" },
  { key: "in-out-count", label: "イン/アウトルール" },
  { key: "createdAt", label: "作成日時" },
];
const headerButtons = [{ label: "新規作成", action: "create" }];

// --- Helper Functions ---
// ページ固有のヘルパー（ルール数計算）はここに残す
const getRuleCount = (
  rules: SecurityRuleDTO[],
  type: "inbound" | "outbound"
) => {
  if (!Array.isArray(rules)) return 0;
  return rules.filter((rule) => rule.ruleType === type).length;
};

// --- Event Handlers ---
// ページ固有のヘッダーアクションはここに残す
const onHeaderAction = (action: string) => {
  if (action === "create") {
    openModal("create-security-groups");
  }
};
</script>
