<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">セキュリティグループモーダルテスト</h1>
    <div class="flex justify-end items-center gap-4 pt-4 border-t">
      <button @click="openModal('create-security-groups')" class="btn-primary">
        新規作成モーダルを開く
      </button>
    </div>
    <!-- セキュリティグループ一覧表示エリア -->
    <div class="mt-8">
      <h2 class="font-semibold text-lg">現在のセキュリティグループ一覧:</h2>
      <ul class="mt-2 space-y-2">
        <li
          v-for="item in securityGroups"
          :key="item.id"
          class="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm"
        >
          <!-- アイテム情報 -->
          <span> {{ item.name }} (説明: {{ item.description }}) </span>
          <!-- 編集ボタン -->
          <button
            @click="handleRowAction({ action: 'edit', row: item })"
            class="btn-secondary"
          >
            編集
          </button>
        </li>
      </ul>
    </div>
  </div>

  <!-- モーダルコンポーネント -->
  <MoSecurityGroupCreate
    :show="activeModal === 'create-security-groups'"
    @close="closeModal"
    @success="handleSuccess"
  />

  <MoSecurityGroupEdit
    :show="activeModal === 'edit-security-groups'"
    :security-group-data="targetForEditing"
    @close="cancelAction"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
// --- Composables Setup ---
const { data: securityGroups, refresh } =
  useResourceList<SecurityGroupDTO>("security-groups");

// ページアクション用のComposableを呼び出し、必要な関数とstateをすべて受け取る
const {
  targetForEditing,
  handleRowAction,
  openModal,
  closeModal,
  cancelAction,
  activeModal,
  handleSuccess,
} = usePageActions<SecurityGroupDTO>({
  resourceName: "security-groups",
  resourceLabel: "セキュリティグループ",
  refresh,
});
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
.btn-secondary {
  @apply py-1 px-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300;
}
</style>
