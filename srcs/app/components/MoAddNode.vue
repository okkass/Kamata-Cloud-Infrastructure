<template>
  <BaseModal :show="show" title="ノードを追加" @close="$emit('close')">
    <div class="space-y-6">
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p class="text-sm text-blue-700">
          ネットワーク内で自動検知されたノード候補が表示されています。<br />
          追加したいノードの「追加」ボタンをクリックしてください。
        </p>
      </div>

      <div class="border rounded-md overflow-hidden bg-white">
        <div
          class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
        >
          <h3 class="font-bold text-sm text-gray-700">検知されたノード一覧</h3>
          <button
            @click="() => refreshCandidates()"
            class="text-xs text-blue-600 hover:underline"
            :disabled="candidatesPending"
          >
            更新
          </button>
        </div>

        <div v-if="candidatesPending" class="p-8 text-center text-gray-500">
          <span class="loading-spinner mr-2"></span>
          候補を検索中...
        </div>

        <div v-else-if="candidatesError" class="p-8 text-center text-red-500">
          一覧の取得に失敗しました: {{ candidatesError.message }}
        </div>

        <div
          v-else-if="!candidateNodes || candidateNodes.length === 0"
          class="p-8 text-center text-gray-500"
        >
          追加可能なノードは見つかりませんでした。
        </div>

        <table v-else class="w-full text-sm text-left">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3">ノード名</th>
              <th class="px-6 py-3">IPアドレス</th>
              <th class="px-6 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="node in candidateNodes"
              :key="node.id || node.ipAddress"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium text-gray-900">
                {{ node.name }}
              </td>
              <td class="px-6 py-4 text-gray-600">
                {{ node.ipAddress }}
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  type="button"
                  @click="onAddClick(node)"
                  class="btn btn-primary text-xs py-1 px-3"
                  :disabled="isCreating"
                >
                  {{ isCreating ? "処理中..." : "追加" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">
          閉じる
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ノード追加モーダル (MoAddNode.vue)
 * =================================================================================
 */
import { useAddNodeForm } from "~/composables/modal/useAddNodeForm";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  candidateNodes,
  candidatesPending,
  candidatesError,
  refreshCandidates,
  isCreating,
  handleAddNode,
} = useAddNodeForm();

// --- Handlers ---
const onAddClick = (node: any) => {
  handleAddNode(node, emit);
};
</script>

<style scoped>
.loading-spinner {
  /* 簡易的なスピナーのスタイル (必要に応じてTailwindの animate-spin 等に置き換え) */
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
