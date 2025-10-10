<template>
  <BaseModal
    :show="show"
    title="ノードをクラスターに追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <h3 class="text-base font-semibold text-gray-800">
        自動検知されたノード一覧
      </h3>

      <div class="border rounded-lg overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th class="px-6 py-3">ノード名</th>
              <th class="px-6 py-3">IPアドレス</th>
              <th class="px-6 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="nodes.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                検知されたノードはありません。
              </td>
            </tr>
            <tr
              v-for="node in nodes"
              :key="node.id"
              class="bg-white border-b last:border-b-0"
            >
              <td class="px-6 py-4 font-medium text-gray-900">
                {{ node.name }}
              </td>
              <td class="px-6 py-4 text-gray-600">
                {{ node.ipAddress }}
              </td>
              <td class="px-6 py-4 text-center">
                <button @click="addNode(node.id)" class="btn-primary">
                  追加
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";

// --- Props: 親コンポーネントからデータを受け取る ---
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  // APIから取得したノードのリストを想定
  nodes: {
    type: Array,
    required: true,
    // データが渡されない場合のダミーデータ
    default: () => [
      { id: "node-x", name: "Node-X", ipAddress: "192.168.1.101" },
      { id: "node-y", name: "Node-Y", ipAddress: "192.168.1.102" },
    ],
  },
});

// --- Emits: 親コンポーネントにイベントを通知する ---
const emit = defineEmits(["close"]);

// --- Methods: コンポーネント内の関数 ---
const addNode = (nodeId) => {
  // 選択されたノードの情報を取得
  const selectedNode = props.nodes.find((node) => node.id === nodeId);
  alert(`${selectedNode.name} (${selectedNode.ipAddress}) を追加します。`);

  // ここで実際の追加APIを呼び出す処理を記述

  // 処理完了後、モーダルを閉じる
  emit("close");
};
</script>

<style scoped>
/* このコンポーネント専用のスタイルや、@applyを使った共通化に利用 */
.btn-primary {
  @apply bg-green-500 text-white font-bold py-1 px-4 rounded-md hover:bg-green-600 transition-colors;
}
</style>
