<template>
  <div>
    <BaseModal :show="show" title="ノード追加" @close="$emit('close')">
      <div class="space-y-6">
        <div class="info-panel info-panel-blue">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="info-panel-icon info-panel-icon-blue"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="info-panel-text-blue">
                ネットワーク内で自動検知されたノード候補が表示されています。<br />
                追加したいノードの「追加」ボタンをクリックしてください。
              </p>
            </div>
          </div>
        </div>

        <div class="border rounded-md overflow-hidden bg-white">
          <div
            class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
          >
            <h3 class="font-bold text-sm text-gray-700">
              検知されたノード一覧
            </h3>
            <button
              @click="() => refreshCandidates()"
              class="text-xs text-blue-600 hover:underline"
              :disabled="candidatesPending"
            >
              更新
            </button>
          </div>

          <div
            v-if="candidatesPending"
            class="p-8 text-center text-gray-500 flex justify-center items-center"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
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
            <thead class="table-header border-b">
              <tr>
                <th class="table-header-cell">ノード名</th>
                <th class="table-header-cell">IPアドレス</th>
                <th class="table-header-cell text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="node in candidateNodes"
                :key="node.id || node.ipAddress"
                class="table-row hover:bg-gray-50"
              >
                <td class="table-cell table-cell-title">
                  {{ node.name }}
                </td>
                <td class="table-cell text-gray-600">{{ node.ipAddress }}</td>
                <td class="table-cell text-center">
                  <button
                    type="button"
                    @click="openPasswordModal(node)"
                    class="btn btn-primary text-xs py-1 px-3"
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
    </BaseModal>

    <BaseModal
      :show="showPasswordModal"
      title="パスワード入力"
      @close="closePasswordModal"
      size="sm"
    >
      <form @submit.prevent="submitAddNode" class="space-y-4">
        <div class="info-panel info-panel-yellow">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="info-panel-icon info-panel-icon-yellow"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="info-panel-title-yellow">実行確認</h3>
              <div class="mt-2 info-panel-text-yellow">
                <p>
                  ノード <strong>{{ selectedNode?.name }}</strong> ({{
                    selectedNode?.ipAddress
                  }}) をクラスターに追加します。
                </p>
                <p class="font-bold mt-1">
                  ※この操作は取り消すことができません。
                </p>
              </div>
            </div>
          </div>
        </div>

        <FormInput
          label="ルートパスワード"
          name="password"
          type="password"
          v-model="password"
          placeholder="8文字以上で入力してください"
          :minlength="8"
          required
          ref="passwordInput"
        />
      </form>

      <template #footer>
        <div class="modal-footer">
          <button
            type="button"
            @click="closePasswordModal"
            class="btn btn-back"
            :disabled="isCreating"
          >
            キャンセル
          </button>
          <button
            type="button"
            @click="submitAddNode"
            class="btn btn-primary"
            :disabled="isCreating || !password || password.length < 8"
          >
            {{ isCreating ? "追加中..." : "追加を実行" }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ノード追加モーダル (MoAddNode.vue)
 * =================================================================================
 */
import { ref, nextTick } from "vue";
import { useAddNodeForm } from "~/composables/modal/useAddNodeForm";
import FormInput from "~/components/Form/Input.vue";

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

// --- Local State for Password Modal ---
const showPasswordModal = ref(false);
const selectedNode = ref<NodeResponse | null>(null);
const password = ref("");
const passwordInput = ref<HTMLInputElement | null>(null);

// パスワードモーダルを開く
const openPasswordModal = (node: NodeResponse) => {
  selectedNode.value = node;
  password.value = "";
  showPasswordModal.value = true;

  nextTick(() => {
    passwordInput.value?.focus();
  });
};

// パスワードモーダルを閉じる
const closePasswordModal = () => {
  showPasswordModal.value = false;
  selectedNode.value = null;
  password.value = "";
};

// 追加実行
const submitAddNode = async () => {
  // ブラウザバリデーション通過後に実行
  if (!selectedNode.value || !password.value || password.value.length < 8)
    return;

  const success = await handleAddNode(selectedNode.value, password.value, emit);

  if (success) {
    closePasswordModal();
    emit("success");
  }
};
</script>
