<template>
  <DashboardLayout
    title="セキュリティグループ"
    :columns="columns"
    :rows="securityGroups"
    rowKey="id"
    :headerButtons="headerButtons"
    @header-action="onHeaderAction"
    @row-action="onRowAction"
  >
    <!-- グループ名をクリックで詳細ページへ遷移させるスロット -->
    <template #cell-name="{ row }">
      <NuxtLink
        :to="`/security-group/${row.id}`"
        class="text-sky-600 hover:text-sky-800 hover:underline font-semibold"
      >
        {{ row.name }}
      </NuxtLink>
    </template>

    <!-- In/Outルール数を表示するためのカスタムセルスロット -->
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

  <!-- 削除確認モーダル -->
  <MoDeleteConfirm
    :show="activeModal === 'deleteSecurityGroup'"
    title="セキュリティグループの削除"
    :message="`本当に '${targetForDeletion?.name}' を削除しますか？`"
    :is-loading="isDeleting"
    @close="cancelDeletion"
    @confirm="handleDelete"
  />

  <!-- 編集モーダル -->
  <MoSecurityGroupEdit
    :show="activeModal === 'editSecurityGroup'"
    :security-group-data="targetForEditing"
    :all-security-groups="securityGroups"
    @close="cancelEditing"
    @success="handleEditSuccess"
  />

  <!-- 作成モーダル -->
  <MoSecurityGroupCreate
    :show="activeModal === 'createSecurityGroup'"
    @close="closeModal"
    @success="handleCreateSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import MoSecurityGroupEdit from "~/components/MoSecurityGroupEdit.vue";

const { activeModal, openModal, closeModal } = useModal();
const { data: securityGroups, refresh } =
  useResourceList<SecurityGroupDTO>("security-groups");
const { executeDelete, isDeleting } = useResourceDelete("security-groups");

const targetForDeletion = ref<SecurityGroupDTO | null>(null);
const targetForEditing = ref<SecurityGroupDTO | null>(null);

const columns = [
  { key: "name", label: "グループ名" },
  { key: "description", label: "説明" },
  { key: "in-out-count", label: "イン/アウトルール" },
  { key: "createdAt", label: "作成日時" },
];

const headerButtons = [{ label: "新規作成", action: "create" }];

const getRuleCount = (
  rules: SecurityRuleDTO[] | undefined,
  type: "inbound" | "outbound"
): number => {
  if (!Array.isArray(rules)) {
    return 0;
  }
  return rules.filter((rule) => rule.ruleType === type).length;
};

// --- Event Handlers ---
const onHeaderAction = (action: string) => {
  if (action === "create") {
    openModal("createSecurityGroup");
  }
};

const onRowAction = ({
  action,
  row,
}: {
  action: string;
  row: SecurityGroupDTO;
}) => {
  if (action === "delete") {
    targetForDeletion.value = row;
    openModal("deleteSecurityGroup");
  }
  if (action === "edit") {
    targetForEditing.value = row;
    openModal("editSecurityGroup");
  }
};

const handleDelete = async () => {
  if (!targetForDeletion.value) return;
  const result = await executeDelete(targetForDeletion.value.id);
  closeModal();
  if (result.success) {
    useToast().addToast({
      message: `'${targetForDeletion.value?.name}' を削除しました。`,
      type: "success",
    });
    await refresh();
  } else {
    useToast().addToast({
      message: `'${targetForDeletion.value?.name}' の削除に失敗しました。`,
      type: "error",
      details: result,
    });
  }
  targetForDeletion.value = null;
};

const cancelDeletion = () => {
  closeModal();
  targetForDeletion.value = null;
};

const handleEditSuccess = async () => {
  closeModal();
  targetForEditing.value = null;
  await refresh();
  useToast().addToast({
    message: "セキュリティグループの保存に成功しました。",
    type: "success",
  });
};

const cancelEditing = () => {
  closeModal();
  targetForEditing.value = null;
};

const handleCreateSuccess = async () => {
  closeModal();
  await refresh();
  useToast().addToast({
    message: "セキュリティグループの作成に成功しました。",
    type: "success",
  });
};
</script>
