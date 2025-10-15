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
        class="table-link"
      >
        {{ row.name }}
      </NuxtLink>
    </template>

    <!-- In/Outルール数を表示 -->
    <template #cell-in-out-count="{ row }">
      <div class="flex items-center justify-center gap-2 text-sm">
        <span class="font-semibold">In:</span>
        <span
          class="count-badge-sky count-badge"
        >
          {{ getRuleCount(row.rules, "inbound") }}
        </span>
        <span class="font-semibold ml-2">Out:</span>
        <span
          class="count-badge-indigo count-badge"
        >
          {{ getRuleCount(row.rules, "outbound") }}
        </span>
      </div>
    </template>

    <!-- 操作メニュー -->
    <template #row-actions="{ row, emit }">
      <NuxtLink
        :to="`/security-group/${row.id}`"
        class="action-item"
      >
        詳細
      </NuxtLink>
      <a
        href="#"
        class="action-item"
        @click.prevent="emit('edit')"
      >
        編集
      </a>
      <a
        href="#"
        class="action-item action-item-danger"
        @click.prevent="emit('delete')"
      >
        削除
      </a>
    </template>
  </DashboardLayout>

  <!-- モーダル定義エリア -->
  <!-- 汎用モーダル (削除確認) -->
  <MoDeleteConfirm
    :show="activeModal === `delete-${RESOURCE_NAME}`"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelAction"
    @confirm="handleDelete"
  />

  <!-- 特化型モーダル (編集) -->
  <MoSecurityGroupEdit
    :show="activeModal === `edit-${RESOURCE_NAME}`"
    :security-group-data="targetForEditing"
    @close="cancelAction"
    @success="handleSuccess"
  />

  <!-- 特化型モーダル (作成) -->
  <MoSecurityGroupCreate
    :show="activeModal === `create-${RESOURCE_NAME}`"
    @close="closeModal"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">

const RESOURCE_NAME = "security-groups";
const resourceLabel = "セキュリティグループ";
// --- Composables Setup ---
// APIから表示するデータを取得
const { data: securityGroups, refresh } =
  useResourceList<SecurityGroupDTO>(RESOURCE_NAME);

// ページのUIアクションを管理するComposableを呼び出し
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
} = usePageActions<SecurityGroupDTO>({
  resourceName: RESOURCE_NAME,
  resourceLabel,
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

// --- Page-Specific Helper Functions ---
/** 指定されたタイプのルール数を計算する */
const getRuleCount = (
  rules: SecurityRuleDTO[] | undefined,
  type: "inbound" | "outbound"
): number => {
  if (!Array.isArray(rules)) return 0;
  return rules.filter((rule) => rule.ruleType === type).length;
};

// --- Page-Specific Event Handlers ---
/** ヘッダーボタンのアクションを処理する */
const onHeaderAction = (action: string) => {
  if (action === "create") {
    openModal(`create-${RESOURCE_NAME}`);
  }
};
</script>
