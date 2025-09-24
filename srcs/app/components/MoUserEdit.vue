<template>
  <BaseModal :show="show" title="利用者の編集" @close="$emit('close')">
    <div class="space-y-4">
      <div>
        <label for="user-account-name-edit" class="form-label"
          >アカウント名</label
        >
        <input
          id="user-account-name-edit"
          type="text"
          v-model="editableUser.accountName"
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
              v-model.number="editableUser.maxCpu"
              class="form-input"
              placeholder="最大CPU数"
            />
            <span class="unit-label">vCPU</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="editableUser.maxMemory"
              class="form-input"
              placeholder="最大メモリ数"
            />
            <span class="unit-label">GB</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="editableUser.maxStorage"
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

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  // APIから取得した編集対象の利用者データ
  userData: {
    type: Object,
    required: true,
    default: () => ({
      id: "user-001",
      accountName: "tanaka-ichiro",
      email: "tanaka@example.com",
      maxCpu: 8,
      maxMemory: 16,
      maxStorage: 200,
    }),
  },
});
const emit = defineEmits(["close", "save"]);

// ==============================================================================
// State
// ==============================================================================
// propsで受け取ったデータを編集するためのローカルコピー
const editableUser = ref({ ...props.userData });

// propsのデータが変更されたら、ローカルコピーも更新
watch(
  () => props.userData,
  (newData) => {
    editableUser.value = { ...newData };
  }
);

// ==============================================================================
// Methods
// ==============================================================================
/**
 * パスワードリセットメールを送信する（ダミー処理）
 */
const sendPasswordResetEmail = () => {
  alert(
    `「${editableUser.value.accountName}」にパスワードリセットメールを送信します。`
  );
  // ここでメール送信APIを呼び出す
};

/**
 * 変更を保存する
 */
const saveChanges = () => {
  console.log("保存データ:", editableUser.value);
  alert(`利用者「${editableUser.value.accountName}」の変更を保存しました。`);
  emit("save", editableUser.value);
  emit("close");
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
.unit-label {
  @apply bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md whitespace-nowrap;
}
</style>
