<template>
  <div class="space-y-4">
    <div>
      <label for="vm-name" class="form-label">仮想マシン名</label>
      <input
        type="text"
        id="vm-name"
        v-model="formData.name"
        class="form-input"
        placeholder="例: vm-middleware01"
      />
    </div>

    <div>
      <label for="node-select" class="form-label">ノード選択</label>
      <div v-if="pending" class="text-gray-500">ノード一覧を読み込み中...</div>
      <div v-else-if="error" class="text-red-500">
        ノード一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="node-select"
        v-model="formData.nodeId"
        class="form-input"
      >
        <option :value="null" disabled>ノードを選択してください</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// ==============================================================================
// 型定義 (APIのレスポンスに合わせて更新)
// ==============================================================================
interface ModelPhysicalNodeDTO {
  id: string;
  name: string;
  ipAddress: string;
  status: string;
  // ... 必要に応じて他のプロパティも定義
}

// ==============================================================================
// フォームの入力データ
// ==============================================================================
const formData = ref({
  name: "",
  nodeId: null,
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 (変更不要) ---
defineExpose({
  formData,
});

// ==============================================================================
// API連携 (エンドポイントを修正)
// ==============================================================================
const {
  data: nodes,
  pending,
  error,
} = useResourceList<ModelPhysicalNodeDTO>("physical-node");
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
