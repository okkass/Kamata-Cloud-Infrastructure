<template>
  <BaseModal :show="show" title="仮想ネットワーク編集" @close="$emit('close')">
    <div v-if="editableNetwork" class="space-y-6">
      <div>
        <label for="network-name-edit" class="form-label">ネットワーク名</label>
        <input
          id="network-name-edit"
          type="text"
          v-model="editableNetwork.name"
          class="form-input"
          disabled
        />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">サブネット一覧</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600">
              <th class="pb-2 font-semibold">サブネット名</th>
              <th class="pb-2 font-semibold">アドレス範囲</th>
              <th class="pb-2 font-semibold">外部接続</th>
              <th class="pb-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subnet in editableNetwork.subnets"
              :key="subnet.id"
              class="border-t"
            >
              <td class="py-2 pr-2">
                <input type="text" v-model="subnet.name" class="table-input" />
              </td>
              <td class="py-2 pr-2">
                <input type="text" v-model="subnet.cidr" class="table-input" />
              </td>
              <td class="py-2 pr-2">
                <select v-model="subnet.external" class="table-input">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </td>
              <td class="py-2 text-center">
                <SecondaryButton
                  @click="deleteSubnet(subnet.id)"
                  class="w-8 h-8 !p-0 flex items-center justify-center !rounded-full"
                >
                  &times;
                </SecondaryButton>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="addSubnet" class="btn-secondary mt-4">
          ＋ サブネットを追加
        </button>
      </div>
    </div>
    <div class="flex justify-end mt-8 pt-4 border-t">
      <SecondaryButton @click="$emit('close')"> キャンセル </SecondaryButton>
      <button @click="saveChanges" class="btn-primary">保存</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のsaveChanges関数内に、APIへのデータ送信ロジックを実装してください。
// watch内のコメント箇所は、APIのレスポンス形式に合わせて調整が必要です。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
const props = defineProps({
  show: { type: Boolean, required: true },
  networkData: { type: Object, required: false },
});
const emit = defineEmits(["close", "save"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const editableNetwork = ref(null);
let nextSubnetId = ref(100); // 新規サブネット用の一意なID

// --- 親から渡されたデータをフォームに反映させる処理 ---
watch(
  () => props.networkData,
  (newData) => {
    // ============================================================================
    // ▼▼▼ API実装担当者の方へ: ここはAPIのレスポンス形式に合わせて調整してください ▼▼▼
    // ============================================================================
    // 親から渡されたデータ(newData)を、フォーム表示用のeditableNetworkに変換しています。
    // APIレスポンスにサブネットが含まれる場合、その形式に合わせてマッピングが必要です。
    if (newData) {
      // JSON.parse(JSON.stringify(...))で安全なディープコピーを作成
      editableNetwork.value = JSON.parse(JSON.stringify(newData));

      // editableNetwork.value.subnets の形式がAPIと合っているか確認してください。
      // 例: APIのレスポンスが { name: 'net-a', subnets: [...] } のような形式を想定
    } else {
      editableNetwork.value = null;
    }
    // ============================================================================
    // ▲▲▲ APIのレスポンス形式に合わせた調整はここまで ▲▲▲
    // ============================================================================
  },
  { immediate: true, deep: true }
);

// --- UI操作のロジック (変更不要) ---
const addSubnet = () => {
  if (!editableNetwork.value) return;
  editableNetwork.value.subnets.push({
    id: `new-${nextSubnetId.value++}`, // 新規作成とわかるように接頭辞を付与
    name: "",
    cidr: "",
    external: false,
  });
};
const deleteSubnet = (idToDelete) => {
  if (!editableNetwork.value) return;
  editableNetwork.value.subnets = editableNetwork.value.subnets.filter(
    (subnet) => subnet.id !== idToDelete
  );
};

/**
 * 「保存」ボタンが押されたときに実行される関数
 */
const saveChanges = () => {
  if (!editableNetwork.value) return;
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. ペイロードの作成:
  //    APIに送信するデータは `editableNetwork.value` に格納されています。
  //    APIの仕様に合わせて、ここからペイロードを構築してください。
  const payload = editableNetwork.value;

  // 2. API呼び出し (PUTリクエスト):
  //    useApiFetchを使って、PUTリクエストを送信します。
  //    (APIのパスはopenapi.jsonなどを参考に、正しいパスを指定してください)
  //    const { data, error } = await useApiFetch(`/virtual-networks/${editableNetwork.value.id}`, {
  //      method: 'PUT',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) { ... } else { ... }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信する更新データ:", payload);
  alert(
    `【ダミー】ネットワーク「${editableNetwork.value.name}」の変更を保存しました。`
  );
  emit("save", editableNetwork.value);
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
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100;
}
.table-input {
  @apply w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300;
}
</style>
