<template>
  <div class="space-y-4">
    <div>
      <label for="vm-name" class="form-label">仮想マシン名</label>
      <input
        type="text"
        id="vm-name"
        v-model="vmName"
        class="form-input"
        placeholder="例: vm-middleware01"
      />
    </div>

    *ここは審議次第であとで消すかも
    <div>
      <label for="node-select" class="form-label">ノード選択</label>
      <select id="node-select" v-model="selectedNode" class="form-input">
        <option value="node1">kci-node1</option>
        <option value="node2">kci-node2</option>
        <option value="node3">kci-node3</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 親コンポーネントから渡される、編集対象のVMの概要データ
const props = defineProps({
  generalData: {
    type: Object,
    required: true,
    // データが渡されない場合のデフォルト値（テスト用）
    default: () => ({
      vmName: "existing-vm-01",
      node: "node2",
    }),
  },
});

// フォームの入力値を、propsで受け取ったデータで初期化
const vmName = ref(props.generalData.vmName);
const selectedNode = ref(props.generalData.node);
</script>

<style scoped>
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
