<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">インスタンスタイプ作成テスト</h1>

    <button @click="openModal('create-instance-types')" class="btn-primary">
      作成モーダルを開く
    </button>

    <div class="mt-8">
      <h2 class="font-semibold">現在のインスタンスタイプ一覧:</h2>
      <ul>
        <li v-for="item in instanceTypes" :key="item.id">
          {{ item.name }} (CPU: {{ item.cpuCores }}, Mem:
          {{ item.memorySize }}GB, Storage: {{ item.storageSize }}GB)
        </li>
      </ul>
    </div>

    <!-- 作成モーダル -->
    <MoInstanceTypeCreate
      :show="activeModal === 'create-instance-types'"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// --- Composables ---
const { activeModal, openModal, closeModal } = useModal();
const { data: instanceTypes, refresh } =
  useResourceList<InstanceTypeCreateRequestDTO>("instance-types");

// ページアクション用のComposableを呼び出し
// handleCreateSuccessが汎用的なhandleSuccessに変わった
const { handleSuccess } = usePageActions({
  resourceLabel: "インスタンスタイプ", // ラベルは現在未使用だが、将来的な拡張のため残す
  resourceName: "instance-types", // 削除など他のアクションで必要
  refresh,
});
</script>

<style scoped>
.btn-primary {
  @apply py-2 px-4 bg-blue-600 text-white rounded-md;
}
</style>
