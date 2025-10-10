<template>
  <BaseModal
    :show="show"
    title="ノードをクラスターに追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <h3 class="modal-section-title">自動検知されたノード一覧</h3>

      <div v-if="pending" class="text-center text-loading py-4">
        ノード一覧を読み込み中...
      </div>
      <div v-else-if="error" class="text-center text-error py-4">
        ノード一覧の取得に失敗しました。
      </div>

      <div v-else class="border rounded-lg overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">ノード名</th>
              <th class="table-header-cell">IPアドレス</th>
              <th class="table-header-cell text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="candidateNodes.length === 0">
              <td colspan="3" class="table-empty-state">
                検知されたノードはありません。
              </td>
            </tr>
            <tr
              v-for="node in candidateNodes"
              :key="node.name"
              class="table-row"
            >
              <td class="table-cell table-cell-title">
                {{ node.name }}
              </td>
              <td class="table-cell text-gray-600">
                {{ node.ipAddress }}
              </td>
              <td class="table-cell text-center">
                <button
                  @click="promptForNodeAdditionConfirmation(node)"
                  class="btn btn-submit"
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

    <div v-if="nodePendingConfirmation" class="confirmation-overlay">
      <div class="confirmation-dialog">
        <p class="confirmation-text">
          ノード「{{ nodePendingConfirmation.name }}」を追加しますか？
        </p>
        <div class="flex justify-center gap-4">
          <button @click="nodePendingConfirmation = null" class="btn btn-back">
            いいえ
          </button>
          <button
            @click="executeAddNodeAfterConfirmation"
            class="btn btn-submit"
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
/**
 * =================================================================================
 * クラスターへのノード追加モーダル (MoAddNodeToCluster.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、自動検知された物理ノードの一覧を表示し、
 * ユーザーが選択したノードをクラスターに追加する機能を提供します。
 * =================================================================================
 */
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Type Definitions
// APIのレスポンスやリクエストの型を定義します。
// ==============================================================================
// GET /api/physical-node で返される「ノード候補」の型
interface PhysicalNodeCandiateDTO {
  name: string;
  ipAddress: string;
}
// POST /api/physical-node で送信するリクエストボディの型
interface PhysicalNodeAddRequestDTO {
  name: string;
  ipAddress: string;
  isAdmin: boolean;
}
// POST成功後に返される、作成済みノードの型
interface PhysicalNodeDTO {
  id: string;
  name: string;
  // ...
}

// ==============================================================================
// API Data Fetching & Submission
// Composableを使ってAPIとの通信を管理します。
// ==============================================================================

// --- ノード候補一覧の取得 ---
const {
  data: candidateNodes, // 変数名をより具体的に
  pending,
  error,
} = useResourceList<PhysicalNodeCandiateDTO>("physical-nodes");

// --- ノード追加処理 ---
const {
  executeCreate: executeAddNodeToCluster, // 関数名をより具体的に
  isCreating,
} = useResourceCreate<PhysicalNodeAddRequestDTO, PhysicalNodeDTO>(
  "physical-nodes"
);

// --- トースト通知 ---
const { addToast } = useToast();

// ==============================================================================
// UI Logic
// ユーザーの操作に応じたコンポーネントの内部状態と挙動を定義します。
// ==============================================================================

// 確認ダイアログで選択されているノードの情報を保持するstate
const nodePendingConfirmation = ref<PhysicalNodeCandiateDTO | null>(null);

/**
 * 「追加」ボタンがクリックされたときに、確認ダイアログを表示します。
 * @param {PhysicalNodeCandiateDTO} node - ユーザーが選択したノードのデータ
 */
const promptForNodeAdditionConfirmation = (node: PhysicalNodeCandiateDTO) => {
  nodePendingConfirmation.value = node;
};

/**
 * 確認ダイアログで「はい」がクリックされたときに、ノード追加APIを実行します。
 */
const executeAddNodeAfterConfirmation = async () => {
  if (!nodePendingConfirmation.value) return;

  // APIに送信するデータ（ペイロード）を構築
  const payload: PhysicalNodeAddRequestDTO = {
    name: nodePendingConfirmation.value.name,
    ipAddress: nodePendingConfirmation.value.ipAddress,
    isAdmin: false, // 仕様に基づき、isAdminはfalseで固定
  };

  // APIリクエストを実行
  const result = await executeAddNodeToCluster(payload);

  // 結果に応じてトースト通知を表示
  if (result.success) {
    addToast({
      type: "success",
      message: `ノード「${payload.name}」が追加されました`,
    });
    emit("success"); // 親コンポーネントに成功を通知（一覧の再取得などを促す）
    emit("close"); // モーダルを閉じる
  } else {
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: result.error?.message,
    });
  }

  // 処理完了後、確認ダイアログを閉じる
  nodePendingConfirmation.value = null;
};
</script>
