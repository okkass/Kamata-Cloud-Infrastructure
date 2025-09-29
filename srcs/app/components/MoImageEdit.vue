<template>
  <BaseModal :show="show" title="イメージ編集" @close="$emit('close')">
    <div v-if="editableImage" class="space-y-4">
      <div>
        <label for="image-name-edit" class="form-label">イメージ名</label>
        <input
          id="image-name-edit"
          type="text"
          v-model="editableImage.name"
          class="form-input"
        />
      </div>

      <div>
        <label for="image-size-edit" class="form-label">サイズ (GB)</label>
        <input
          id="image-size-edit"
          type="number"
          v-model.number="editableImage.size"
          class="form-input"
          disabled
        />
      </div>

      <div>
        <label for="image-description-edit" class="form-label">説明</label>
        <textarea
          id="image-description-edit"
          rows="4"
          v-model="editableImage.description"
          class="form-input"
        ></textarea>
      </div>
    </div>
    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
      <button @click="saveChanges" class="btn-primary">保存</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToast } from "~/composables/useToast"; // Toast通知用のComposableをインポート

// ==============================================================================
// 担当者（API実装担当）へのメッセージ:
// 下記のsaveChanges関数内に、APIへのデータ送信ロジックを実装してください。
// watch内のコメント箇所は、APIのレスポンス形式に合わせて調整が必要です。
// ==============================================================================

// --- 親コンポーネントとの連携定義 (変更不要) ---
const props = defineProps({
  show: { type: Boolean, required: true },
  imageData: { type: Object, required: false },
});
const emit = defineEmits(["close", "save"]);

// --- フォームの入力データを保持するリアクティブ変数 (変更不要) ---
const editableImage = ref(null);
const { addToast } = useToast(); // Toast通知関数を取得

// --- 親から渡されたデータをフォームに反映させる処理 ---
watch(
  () => props.imageData,
  (newData) => {
    // ============================================================================
    // ▼▼▼ API実装担当者の方へ: ここはAPIのレスポンス形式に合わせて調整してください ▼▼▼
    // ============================================================================
    // 親から渡されたデータ(newData)を、フォーム表示用のeditableImageに変換しています。
    // サイズはAPIからはバイト単位で渡される想定のため、UI表示用にGB単位へ変換しています。
    if (newData) {
      editableImage.value = {
        id: newData.id,
        name: newData.name,
        description: newData.description,
        // APIのキーが 'size' でバイト単位の場合の例
        size: (newData.size || 0) / (1024 * 1024 * 1024),
      };
    } else {
      editableImage.value = null;
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
  if (!editableImage.value) return;
  // ============================================================================
  // ▼▼▼ API実装担当者の方へ: この中にAPI呼び出し処理を実装してください ▼▼▼
  // ============================================================================

  // 1. ペイロードの作成:
  //    APIに送信するデータを作成します。
  const payload = {
    name: editableImage.value.name,
    description: editableImage.value.description,
  };

  // 2. API呼び出し (PUTリクエスト):
  //    const { data, error } = await useApiFetch(`/images/${editableImage.value.id}`, {
  //      method: 'PUT',
  //      body: payload,
  //    });

  // 3. 結果のハンドリング:
  //    if (error.value) {
  //      addToast({ message: 'イメージの更新に失敗しました。', type: 'error' });
  //    } else {
  //      addToast({ message: `イメージ「${data.value.name}」を更新しました。`, type: 'success' });
  //      emit('save', data.value);
  //      emit('close');
  //    }

  // --- 現在はAPI実装前のダミー動作 ---
  console.log("APIに送信する更新データ:", payload);
  addToast({
    message: `【ダミー】イメージ「${editableImage.value.name}」を更新しました。`,
    type: "success",
  });
  emit("save", editableImage.value);
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
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
