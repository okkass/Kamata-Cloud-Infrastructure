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
            <tr v-if="nodes.length === 0">
              <td colspan="3" class="table-empty-state">
                検知されたノードはありません。
              </td>
            </tr>
            <tr v-for="node in nodes" :key="node.name" class="table-row">
              <td class="table-cell table-cell-title">
                {{ node.name }}
              </td>
              <td class="table-cell text-gray-600">
                {{ node.ipAddress }}
              </td>
              <td class="table-cell text-center">
                <button
                  @click="openConfirmation(node)"
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

    <div v-if="nodeToConfirm" class="confirmation-overlay">
      <div class="confirmation-dialog">
        <p class="confirmation-text">
          ノード「{{ nodeToConfirm.name }}」を追加しますか？
        </p>
        <div class="flex justify-center gap-4">
          <button @click="nodeToConfirm = null" class="btn btn-back">いいえ</button>
          <button
            @click="confirmAddNode"
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
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// (API連携のセットアップは変更なし)
const {
  data: nodes,
  pending,
  error,
} = useResourceList<PhysicalNodeCandiateDTO>("physical-node");
const { executeCreate, isCreating } = useResourceCreate<
  PhysicalNodeAddRequestDTO,
  PhysicalNodeDTO
>("physical-node");
const { addToast } = useToast();

// (UIロジックの状態管理は変更なし)
const nodeToConfirm = ref<PhysicalNodeCandiateDTO | null>(null);

const openConfirmation = (node: PhysicalNodeCandiateDTO) => {
  nodeToConfirm.value = node;
};

/**
 * 確認ポップアップで「はい」が押されたときにノード追加APIを実行する
 */
const confirmAddNode = async () => {
  if (!nodeToConfirm.value) return;

  const payload: PhysicalNodeAddRequestDTO = {
    name: nodeToConfirm.value.name,
    ipAddress: nodeToConfirm.value.ipAddress,
    isAdmin: false,
  };

  const result = await executeCreate(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `ノード「${payload.name}」が追加されました`,
    });
    emit("success");
    emit("close");
  } else {
    addToast({
      type: "error",
      message: "ノードの追加に失敗しました。",
      details: result.error?.message,
    });
  }

  nodeToConfirm.value = null;
};
</script>
