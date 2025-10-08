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

      <div v-if="pending" class="text-center text-gray-500 py-4">
        ノード一覧を読み込み中...
      </div>
      <div v-else-if="error" class="text-center text-red-500 py-4">
        ノード一覧の取得に失敗しました。
      </div>
      <div v-else class="border rounded-lg overflow-hidden">
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
                <button
                  @click="openConfirmation(node)"
                  class="btn-primary"
                  :disabled="isCreating"
                >
                  追加
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="nodeToConfirm"
      class="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center"
    >
      <div
        class="bg-white p-6 rounded-lg shadow-xl border text-center space-y-4"
      >
        <p class="font-semibold">
          ノード「{{ nodeToConfirm.name }}」を追加しますか？
        </p>
        <div class="flex justify-center gap-4">
          <button @click="nodeToConfirm = null" class="btn-secondary">
            いいえ
          </button>
          <button
            @click="confirmAddNode"
            class="btn-primary"
            :disabled="isCreating"
          >
            {{ isCreating ? "追加中..." : "はい" }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// 型定義
// ==============================================================================
interface NodeDTO {
  id: string;
  name: string;
  ipAddress: string;
  isAdmin?: boolean;
}

// --- 親コンポーネントとの連携 ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// API連携
// ==============================================================================
// --- ノード候補一覧の取得 ---
const {
  data: nodes,
  pending,
  error,
} = useResourceList<NodeDTO>("physical-node");

// --- ノード追加処理 ---
const { executeCreate, isCreating } = useResourceCreate<NodeDTO, NodeDTO>(
  "physical-node"
);
const { addToast } = useToast();

// ==============================================================================
// UIロジック
// ==============================================================================
// --- 確認ポップアップ用の状態管理 ---
const nodeToConfirm = ref<NodeDTO | null>(null);

/**
 * 「追加」ボタンが押されたときに確認ポップアップを表示する
 */
const openConfirmation = (node: NodeDTO) => {
  nodeToConfirm.value = node;
};

/**
 * 確認ポップアップで「はい」が押されたときにノード追加APIを実行する
 */
const confirmAddNode = async () => {
  if (!nodeToConfirm.value) return;

  const payload: NodeDTO = {
    name: nodeToConfirm.value.name,
    ipAddress: nodeToConfirm.value.ipAddress,
    isAdmin: false, // API仕様に基づき、デフォルト値を設定
  };

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `ノード「${result.data?.name}」が追加されました`,
    });
    emit("success"); // 親コンポーネントに成功を通知 (リストの再取得など)
    emit("close"); // モーダルを閉じる
  } else {
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: result.error?.message,
    });
  }

  // 処理完了後、確認ポップアップを閉じる
  nodeToConfirm.value = null;
};
</script>

<style scoped>
.btn-primary {
  @apply bg-green-500 text-white font-bold py-1 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-700 font-semibold py-1 px-4 rounded-md hover:bg-gray-300;
}
</style>
