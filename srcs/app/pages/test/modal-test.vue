<template>
  <p>mo-daru test</p>
  <div>
    <button class="btn-primary" @click="openModal('create')">
      モーダルを開く
    </button>
    <MoImageAdd
      :show="activeModal === 'create'"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
// --- Composables Setup ---
const { data: virtualMachines, refresh } =
  useResourceList<VirtualMachineDTO>("virtual-machine");

// ページアクション用のComposableを呼び出し、必要な関数とstateをすべて受け取る
const {
  targetForEditing,
  handleRowAction,
  handleSuccess,
  cancelAction,
  activeModal,
  openModal,
  closeModal,
} = usePageActions<VirtualMachineDTO>({
  resourceName: "virtual-machine",
  resourceLabel: "仮想マシン",
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
