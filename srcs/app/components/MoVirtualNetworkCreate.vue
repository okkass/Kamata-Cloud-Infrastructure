<template>
  <!-- BaseModalで全体を囲み、「完成品のモーダル」にする -->
  <BaseModal :show="show" title="仮想ネットワーク作成" @close="$emit('close')">
    <!-- ======== フォームの見た目 (ここから) ======== -->
    <div class="space-y-4">
      <div>
        <label for="network-name-create" class="form-label"
          >ネットワーク名</label
        >
        <input
          id="network-name-create"
          type="text"
          v-model="networkData.name"
          class="form-input"
        />
      </div>

      <div>
        <label for="ip-address-create" class="form-label"
          >IPアドレス / CIDR</label
        >
        <input
          id="ip-address-create"
          type="text"
          v-model="networkData.cidr"
          class="form-input"
          placeholder="例: 192.168.0.0/16"
        />
      </div>
    </div>
    <!-- ======== フォームの見た目 (ここまで) ======== -->

    <!-- フッターのアクションボタン -->
    <div class="flex justify-end mt-8 pt-4 border-t">
      <button @click="createNetwork" class="btn-primary">作成</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のcreateNetwork関数内に、APIへのデータ送信ロジックを実装してください。
// フォームの入力データは `networkData.value` に格納されています。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "create"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const networkData = ref({
  name: "",
  cidr: "",
});

/**
 * 「作成」ボタンが押されたときに実行される関数
 */
const createNetwork = () => {
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. ペイロードの作成:
  //    APIに送信するデータは `networkData.value` に格納されています。
  //    必要に応じて、ここからペイロードを構築してください。
  const payload = networkData.value;

  // 2. API呼び出し:
  //    useApiFetchを使って、POSTリクエストを送信します。
  //    (APIのパスはopenapi.jsonなどを参考に、正しいパスを指定してください)
  //    const { data, error } = await useApiFetch('/virtual-networks', {
  //      method: 'POST',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) {
  //      alert('ネットワークの作成に失敗しました。');
  //    } else {
  //      alert(`ネットワーク「${data.value.name}」を作成しました。`);
  //      emit('create', data.value); // 親コンポーネントに成功を通知
  //      emit('close'); // モーダルを閉じる
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信するデータ:", payload);
  alert(`【ダミー】ネットワーク「${networkData.value.name}」を作成しました。`);
  emit("create", networkData.value);
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
