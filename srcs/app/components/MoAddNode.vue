<template>
  <div>
    <BaseModal :show="show" title="ノード追加" @close="$emit('close')">
      <div class="space-y-6">
        <UiBaseAlert>
          <p>
            ネットワーク内で自動検知されたノード候補が表示されています。<br />
            追加したいノードの「追加」ボタンをクリックしてください。
          </p>
        </UiBaseAlert>

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

          <UiBaseLoading v-if="candidatesPending">
            候補を検索中...
          </UiBaseLoading>

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
        <UiBaseAlert type="warning" title="実行確認">
          <p>
            ノード <strong>{{ selectedNode?.name }}</strong> ({{
              selectedNode?.ipAddress
            }}) をクラスターに追加します。
          </p>
          <p class="font-bold mt-1">※この操作は取り消すことができません。</p>
        </UiBaseAlert>
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
          <UiSubmitButton
            label="ノードを追加"
            :loading="isCreating"
            @click="submitAddNode"
            :disabled="isCreating || password.length < 8"
          />
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
  isValid,
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
