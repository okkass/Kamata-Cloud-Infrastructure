<template>
  <BaseModal :show="show" title="利用者の追加" @close="$emit('close')">
    <div class="space-y-4">
      <div>
        <label for="user-account-name" class="form-label">アカウント名</label>
        <input
          id="user-account-name"
          type="text"
          v-model="newUser.accountName"
          class="form-input"
        />
      </div>

      <div>
        <label for="user-email" class="form-label">メールアドレス</label>
        <input
          id="user-email"
          type="email"
          v-model="newUser.email"
          class="form-input"
        />
      </div>

      <div class="pt-2">
        <label class="form-label">最大リソース制限</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxCpu"
              class="form-input"
              placeholder="最大CPU数"
            />
            <span class="unit-label">vCPU</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxMemory"
              class="form-input"
              placeholder="最大メモリ数"
            />
            <span class="unit-label">GB</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="newUser.maxStorage"
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

// ==============================================================================
// Props & Emits
// ==============================================================================
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["close", "add"]);

// ==============================================================================
// State
// ==============================================================================
const newUser = ref({
  accountName: "",
  email: "",
  maxCpu: null,
  maxMemory: null,
  maxStorage: null,
});

// ==============================================================================
// Methods
// ==============================================================================
/**
 * 利用者を追加する処理
 */
const addUser = () => {
  console.log("追加データ:", newUser.value);
  alert(`利用者「${newUser.value.accountName}」を追加しました。`);
  emit("add", newUser.value);
  emit("close");
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
.unit-label {
  @apply bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md;
}
</style>
