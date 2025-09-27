<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">インスタンスタイプ管理テスト</h1>

    <!-- 作成モーダルを開くボタン -->
    <button @click="openModal('create-instance-types')" class="btn-primary">
      新規作成モーダルを開く
    </button>

    <!-- インスタンスタイプ一覧表示エリア -->
    <div class="mt-8">
      <h2 class="font-semibold text-lg">現在のインスタンスタイプ一覧:</h2>
      <ul class="mt-2 space-y-2">
        <li
          v-for="item in instanceTypes"
          :key="item.id"
          class="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm"
        >
          <!-- アイテム情報 -->
          <span>
            {{ item.name }} (CPU: {{ item.cpuCores }}, Mem:
            {{ item.memorySize }}GB, Storage: {{ item.storageSize }}GB)
          </span>
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

    <!-- 作成モーダル -->
    <MoInstanceTypeCreate
      :show="activeModal === 'create-instance-types'"
      @close="closeModal"
      @success="handleSuccess"
    />

    <!-- 編集モーダル -->
    <MoInstanceTypeEdit
      :show="activeModal === 'edit-instance-types'"
      :instance-type-data="targetForEditing"
      @close="cancelAction"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// --- Composables Setup ---
const { data: instanceTypes, refresh } =
  useResourceList<ModelInstanceTypeDTO>("instance-types");

// ページアクション用のComposableを呼び出し、必要な関数とstateをすべて受け取る
const {
  targetForEditing,
  handleRowAction,
  handleSuccess,
  cancelAction,
  activeModal,
  openModal,
  closeModal,
} = usePageActions<ModelInstanceTypeDTO>({
  resourceName: "instance-types",
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
