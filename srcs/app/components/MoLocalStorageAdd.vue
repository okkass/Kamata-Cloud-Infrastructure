<template>
  <BaseModal
    :show="show"
    title="ローカルストレージ追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div>
        <label for="node-name-select" class="form-label">ノード名</label>
        <select
          id="node-name-select"
          v-model="storageData.nodeId"
          class="form-input"
        >
          <option :value="null" disabled>ノードを選択してください</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="disk-name-input" class="form-label">ディスク名</label>
        <input
          id="disk-name-input"
          type="text"
          v-model="storageData.diskName"
          class="form-input"
          placeholder="例: Disk01"
        />
      </div>

      <div>
        <label for="recognized-disk-select" class="form-label"
          >認識ディスク</label
        >
        <select
          id="recognized-disk-select"
          v-model="storageData.devicePath"
          class="form-input"
        >
          <option :value="null" disabled>認識ディスクを選択してください</option>
          <option
            v-for="disk in availableDisks"
            :key="disk.path"
            :value="disk.path"
          >
            {{ disk.path }} ({{ disk.size }} GB)
          </option>
        </select>
      </div>
    </div>
    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
      <SecondaryButton @click="$emit('close')"> キャンセル </SecondaryButton>
      <button @click="addStorage" class="btn-primary">追加</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のaddStorage関数内に、APIへのデータ送信ロジックを実装してください。
// このコンポーネントは親から `nodes` と `availableDisks` のリストを
// propsとして受け取ることを想定しています。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
const props = defineProps({
  show: { type: Boolean, required: true },
  // 親から渡されるノードのリスト
  nodes: { type: Array, default: () => [] },
  // 親から渡される利用可能な物理ディスクのリスト
  availableDisks: { type: Array, default: () => [] },
});
const emit = defineEmits(["close", "create"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const storageData = ref({
  nodeId: null,
  diskName: "",
  devicePath: null,
});

/**
 * 「追加」ボタンが押されたときに実行される関数
 */
const addStorage = () => {
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. ペイロードの作成:
  //    APIに送信するデータは `storageData.value` に格納されています。
  const payload = storageData.value;

  // 2. API呼び出し (POSTリクエスト):
  //    useApiFetchを使って、POSTリクエストを送信します。
  //    (APIのパスはopenapi.jsonなどを参考に、正しいパスを指定してください)
  //    const { data, error } = await useApiFetch('/local-storages', {
  //      method: 'POST',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) { ... } else { ... }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信するデータ:", payload);
  alert(
    `【ダミー】ローカルストレージ「${storageData.value.diskName}」を追加しました。`
  );
  emit("create", storageData.value);
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
