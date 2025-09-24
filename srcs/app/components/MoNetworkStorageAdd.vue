<template>
  <BaseModal
    :show="show"
    title="ネットワークストレージ追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div>
        <label for="node-select" class="form-label">作成先物理ノード</label>
        <select id="node-select" v-model="selectedNode" class="form-input">
          <option :value="null" disabled>選択してください</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="local-storage-select" class="form-label"
          >作成先ローカルストレージ</label
        >
        <select
          id="local-storage-select"
          v-model="selectedLocalStorage"
          class="form-input"
        >
          <option :value="null" disabled>選択してください</option>
          <option
            v-for="storage in localStorages"
            :key="storage.id"
            :value="storage.id"
          >
            {{ storage.name }} ({{ storage.path }})
          </option>
        </select>
      </div>

      <div>
        <label for="storage-size" class="form-label"
          >ストレージサイズ (GB)</label
        >
        <input
          id="storage-size"
          type="number"
          v-model.number="storageSize"
          class="form-input"
          placeholder="例: 100"
        />
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
      <button @click="createNetworkStorage" class="btn-primary">作成</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  // モーダルの表示状態
  show: {
    type: Boolean,
    required: true,
  },
  // APIから取得した物理ノードのリスト
  nodes: {
    type: Array,
    required: true,
    default: () => [
      { id: "node-01", name: "kci-node01" },
      { id: "node-02", name: "kci-node02" },
      { id: "node-03", name: "kci-node03" },
    ],
  },
  // APIから取得したローカルストレージのリスト
  localStorages: {
    type: Array,
    required: true,
    default: () => [
      { id: "ls-01", name: "local-storage-a", path: "/var/lib/storage-a" },
      { id: "ls-02", name: "local-storage-b", path: "/var/lib/storage-b" },
    ],
  },
});

const emit = defineEmits(["close", "create"]);

// ==============================================================================
// State
// ==============================================================================
const selectedNode = ref(null);
const selectedLocalStorage = ref(null);
const storageSize = ref(100);

// ==============================================================================
// Methods
// ==============================================================================
/**
 * ネットワークストレージを作成する処理
 */
const createNetworkStorage = () => {
  const payload = {
    nodeId: selectedNode.value,
    localStorageId: selectedLocalStorage.value,
    size: storageSize.value,
  };

  // 本来はここでAPIに payload を送信する
  console.log("作成データ:", payload);
  alert("ネットワークストレージを作成しました。");

  emit("create", payload);
  emit("close");
};
</script>

<style scoped>
/* 共通スタイルを@applyで定義 */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
