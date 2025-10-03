<template>
  <BaseModal :show="show" title="利用者の編集" @close="$emit('close')">
    <div v-if="editableUser" class="space-y-4">
      <div>
        <label for="user-account-name-edit" class="form-label"
          >アカウント名</label
        >
        <input
          id="user-account-name-edit"
          type="text"
          v-model="editableUser.name"
          class="form-input"
          disabled
        />
      </div>

      <div>
        <label for="user-email-edit" class="form-label">メールアドレス</label>
        <input
          id="user-email-edit"
          type="email"
          v-model="editableUser.email"
          class="form-input"
        />
      </div>

      <div class="pt-2">
        <label class="form-label">最大リソース制限</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="editableUser.maxCpuCores"
              class="form-input"
              placeholder="最大CPU数"
            />
            <span class="unit-label">vCPU</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="editableUser.maxMemorySize"
              class="form-input"
              placeholder="最大メモリ数"
            />
            <span class="unit-label">GB</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="editableUser.maxStorageSize"
              class="form-input"
              placeholder="最大ストレージ数"
            />
            <span class="unit-label">GB</span>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <label class="form-label">パスワード</label>
        <SecondaryButton @click="sendPasswordResetEmail">
          パスワードリセットメールを送る
        </SecondaryButton>
      </div>
    </div>
    <div class="flex justify-end mt-8 pt-4 border-t">
      <button @click="saveChanges" class="btn-primary">保存</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToast } from "~/composables/useToast"; // Toast通知用のComposableをインポート

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のsaveChanges関数とsendPasswordResetEmail関数内に、
// APIへのデータ送信ロジックを実装してください。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
const props = defineProps({
  show: { type: Boolean, required: true },
  userData: { type: Object, required: false },
});
const emit = defineEmits(["close", "save"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const editableUser = ref(null);
const { addToast } = useToast(); // Toast通知関数を取得

// --- 親から渡されたデータをフォームに反映させる処理 ---
watch(
  () => props.userData,
  (newData) => {
    // ============================================================================
    // ▼▼▼ API実装担当者の方へ: ここはAPIのレスポンス形式に合わせて調整してください ▼▼▼
    // ============================================================================
    if (newData) {
      editableUser.value = {
        id: newData.id,
        name: newData.name,
        email: newData.email,
        maxCpuCores: newData.maxCpuCores || 0,
        maxMemorySize: (newData.maxMemorySize || 0) / (1024 * 1024 * 1024),
        maxStorageSize: (newData.maxStorageSize || 0) / (1024 * 1024 * 1024),
      };
    } else {
      editableUser.value = null;
    }
    // ============================================================================
    // ▲▲▲ APIのレスポンス形式に合わせた調整はここまで ▲▲▲
    // ============================================================================
  },
  { immediate: true, deep: true }
);

/**
 * 「保存」ボタンが押されたときに実行される関数
 */
const saveChanges = () => {
  if (!editableUser.value) return;

  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  const payload = {
    name: editableUser.value.name,
    email: editableUser.value.email,
    maxCpuCores: editableUser.value.maxCpuCores,
    maxMemorySize: (editableUser.value.maxMemorySize || 0) * 1024 * 1024 * 1024,
    maxStorageSize:
      (editableUser.value.maxStorageSize || 0) * 1024 * 1024 * 1024,
  };

  // 2. API呼び出し (PUTリクエスト):
  //    const { data, error } = await useApiFetch(`/users/${editableUser.value.id}`, {
  //      method: 'PUT',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) {
  //      addToast({ message: 'ユーザー情報の更新に失敗しました。', type: 'error' });
  //    } else {
  //      addToast({ message: `利用者「${data.value.name}」の変更を保存しました。`, type: 'success' });
  //      emit("save", data.value);
  //      emit("close");
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信する更新データ:", payload);
  addToast({
    message: `【ダミー】利用者「${editableUser.value.name}」の変更を保存しました。`,
    type: "success",
  });
  emit("save", editableUser.value);
  emit("close");
  // ============================================================================
  // ▲▲▲ API実装はここまで ▲▲▲
  // ============================================================================
};

/**
 * 「パスワードリセットメールを送る」ボタンが押されたときに実行される関数
 */
const sendPasswordResetEmail = () => {
  if (!editableUser.value) return;
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にメール送信APIの呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // --- 現在はAPI実装前のダミー動作 ---
  addToast({
    message: `【ダミー】「${editableUser.value.name}」にパスワードリセットメールを送信します。`,
    type: "info",
  });
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
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
.unit-label {
  @apply bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md whitespace-nowrap;
}
</style>
