<template>
  <div class="space-y-4">
    <div>
      <label for="vm-name" class="form-label">仮想マシン名</label>
      <input
        type="text"
        id="vm-name"
        v-model="formData.vmName"
        class="form-input"
        placeholder="例: vm-middleware01"
      />
    </div>

    <div>
      <label for="node-select" class="form-label">ノード選択</label>
      <select id="node-select" v-model="formData.nodeId" class="form-input">
        <option :value="null" disabled>ノードを選択してください</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ node.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// このコンポーネントは、VMの概要情報を入力するためのフォームです。
// APIから「ノード一覧」を取得し、`nodes` のrefを更新する処理を実装してください。
// ==============================================================================

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const formData = ref({
  vmName: "",
  nodeId: null,
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 ---
defineExpose({
  formData,
});

// ============================================================================
// ▼▼▼ API実装担当者の方へ: ここにAPIからノード一覧を取得する処理を実装してください ▼▼▼
// ============================================================================

// --- APIから取得するノード一覧データ（現在はダミー） ---
const nodes = ref([
  { id: "node-1", name: "kci-node1" },
  { id: "node-2", name: "kci-node2" },
  { id: "node-3", name: "kci-node3" },
]);

// onMounted(async () => {
//   // ページが読み込まれたら、APIからノード一覧を取得
//   const { data, error } = await useApiFetch('/nodes');
//   if (!error.value) {
//     nodes.value = data.value;
//   }
// });

// ============================================================================
// ▲▲▲ API実装はここまで ▲▲▲
// ============================================================================
</script>

<style scoped>
/* ラベルの共通スタイル */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
/* 入力欄（input, select）の共通スタイル */
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
