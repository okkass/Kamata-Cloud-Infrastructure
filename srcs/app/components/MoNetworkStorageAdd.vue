<template>
  <BaseModal
    :show="show"
    title="ネットワークストレージ追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div>
        <label for="node-select-ns-add" class="form-label"
          >作成先物理ノード</label
        >
        <select
          id="node-select-ns-add"
          v-model="networkStorageData.nodeId"
          class="form-input"
        >
          <option :value="null" disabled>選択してください</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="local-storage-select-ns-add" class="form-label"
          >作成先ローカルストレージ</label
        >
        <select
          id="local-storage-select-ns-add"
          v-model="networkStorageData.localStorageId"
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
        <label for="storage-size-ns-add" class="form-label"
          >ストレージサイズ (GB)</label
        >
        <input
          id="storage-size-ns-add"
          type="number"
          v-model.number="networkStorageData.size"
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
import { useToast } from "~/composables/useToast"; // Toast通知用のComposableをインポート

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のcreateNetworkStorage関数内に、APIへのデータ送信ロジックを実装してください。
// このコンポーネントは親から `nodes` と `localStorages` のリストを
// propsとして受け取ることを想定しています。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
const props = defineProps({
  show: { type: Boolean, required: true },
  nodes: { type: Array, required: true, default: () => [] },
  localStorages: { type: Array, required: true, default: () => [] },
});
const emit = defineEmits(["close", "create"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const networkStorageData = ref({
  nodeId: null,
  localStorageId: null,
  size: 100, // UI上ではGB単位
});
const { addToast } = useToast(); // Toast通知関数を取得

/**
 * 「作成」ボタンが押されたときに実行される関数
 */
const createNetworkStorage = () => {
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. ペイロードの作成:
  //    APIに送信するデータを作成します。
  //    APIがサイズをバイト単位で要求する場合、ここで変換が必要です。
  const payload = {
    nodeId: networkStorageData.value.nodeId,
    localStorageId: networkStorageData.value.localStorageId,
    // GBをバイトに変換する例
    size: (networkStorageData.value.size || 0) * 1024 * 1024 * 1024,
  };

  // 2. API呼び出し (POSTリクエスト):
  //    const { data, error } = await useApiFetch('/network-storages', {
  //      method: 'POST',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) {
  //      addToast({ message: 'ネットワークストレージの作成に失敗しました。', type: 'error' });
  //    } else {
  //      addToast({ message: 'ネットワークストレージを作成しました。', type: 'success' });
  //      emit('create', data.value);
  //      emit('close');
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信するデータ:", payload);
  addToast({
    message: "【ダミー】ネットワークストレージを作成しました。",
    type: "success",
  });
  emit("create", networkStorageData.value);
  emit("close");
  // ============================================================================
  // ▲▲▲ API実装はここまで ▲▲▲
  // ============================================================================
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
