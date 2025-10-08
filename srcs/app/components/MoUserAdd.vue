<template>
  <BaseModal :show="show" title="利用者の追加" @close="$emit('close')">
    <div class="space-y-4">
      <div>
        <label for="user-account-name-add" class="form-label"
          >アカウント名</label
        >
        <input
          id="user-account-name-add"
          type="text"
          v-model="newUser.name"
          class="form-input"
        />
      </div>
      <div>
        <label for="user-email-add" class="form-label">メールアドレス</label>
        <input
          id="user-email-add"
          type="email"
          v-model="newUser.email"
          class="form-input"
        />
      </div>
      <div>
        <label for="user-password-add" class="form-label">パスワード</label>
        <input
          id="user-password-add"
          type="password"
          v-model="newUser.password"
          class="form-input"
        />
      </div>
      <div class="pt-2">
        <label class="form-label">最大リソース制限</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxCpuCores"
              class="form-input"
              placeholder="最大CPU数"
            />
            <span class="unit-label">vCPU</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxMemorySize"
              class="form-input"
              placeholder="最大メモリ数"
            />
            <span class="unit-label">GB</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxStorageSize"
              class="form-input"
              placeholder="最大ストレージ数"
            />
            <span class="unit-label">GB</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end mt-8 pt-4 border-t">
      <button @click="addUser" class="btn-primary">追加</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "~/composables/useToast"; // Toast通知用のComposableをインポート

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のaddUser関数内に、APIへのデータ送信ロジックを実装してください。
// フォームの入力データは `newUser.value` に格納されています。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "add"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const newUser = ref({
  name: "",
  email: "",
  password: "",
  useTOTP: false,
  isAdmin: false,
  maxCpuCores: null,
  maxMemorySize: null, // UI上ではGB単位
  maxStorageSize: null, // UI上ではGB単位
});
const { addToast } = useToast(); // Toast通知関数を取得

/**
 * 「追加」ボタンが押されたときに実行される関数
 */
const addUser = () => {
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  const payload = {
    ...newUser.value,
    maxMemorySize: (newUser.value.maxMemorySize || 0) * 1024 * 1024 * 1024,
    maxStorageSize: (newUser.value.maxStorageSize || 0) * 1024 * 1024 * 1024,
  };

  // 3. API呼び出し:
  //    const { data, error } = await useApiFetch('/users', {
  //      method: 'POST',
  //      body: payload,
  //    });

  // 4. 結果のハンドリング:
  //    if (error.value) {
  //      addToast({ message: 'ユーザーの作成に失敗しました。', type: 'error' });
  //    } else {
  //      addToast({ message: `利用者「${data.value.name}」を追加しました。`, type: 'success' });
  //      emit('add', data.value);
  //      emit('close');
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信するデータ:", payload);
  addToast({
    message: `【ダミー】利用者「${newUser.value.name}」を追加しました。`,
    type: "success",
  });
  emit("add", newUser.value);
  emit("close");
  // ============================================================================
  // ▲▲▲ API実装はここまで ▲▲▲
  // ============================================================================
};
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
.unit-label {
  @apply bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md;
}
</style>
