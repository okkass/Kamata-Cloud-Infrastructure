<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div>
        <label for="instance-type-name" class="form-label"
          >インスタンスタイプ名</label
        >
        <input
          id="instance-type-name"
          type="text"
          v-model="newInstanceType.name"
          class="form-input"
          placeholder="例: standard.xlarge"
        />
      </div>

      <div>
        <label for="instance-vcpu" class="form-label">vCPU数</label>
        <input
          id="instance-vcpu"
          type="number"
          v-model.number="newInstanceType.vcpus"
          class="form-input"
          placeholder="例: 16"
        />
      </div>

      <div>
        <label for="instance-memory" class="form-label">メモリ数</label>
        <div class="flex items-center gap-2">
          <input
            id="instance-memory"
            type="number"
            v-model.number="newInstanceType.memory"
            class="form-input"
            placeholder="例: 32"
          />
          <span class="font-semibold text-gray-600">GB</span>
        </div>
      </div>

      <div>
        <label for="instance-storage" class="form-label">ストレージ数</label>
        <div class="flex items-center gap-2">
          <input
            id="instance-storage"
            type="number"
            v-model.number="newInstanceType.storage"
            class="form-input"
            placeholder="例: 500"
          />
          <span class="font-semibold text-gray-600">GB</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
      <button @click="createInstanceType" class="btn-primary">作成</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";

// ==============================================================================
// Props & Emits
// 親コンポーネントとの連携を定義
// ==============================================================================
defineProps({
  // モーダルの表示状態
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "create"]);

// ==============================================================================
// State
// コンポーネント内の状態を管理
// ==============================================================================
// 新しく作成するインスタンスタイプのデータを保持するオブジェクト
const newInstanceType = ref({
  name: "",
  vcpus: null,
  memory: null,
  storage: null,
});

// ==============================================================================
// Methods
// コンポーネントの動作を定義
// ==============================================================================
/**
 * インスタンスタイプを作成する処理
 */
const createInstanceType = () => {
  // 本来はここでAPIに newInstanceType.value を送信する
  console.log("作成データ:", newInstanceType.value);
  alert(`「${newInstanceType.value.name}」を作成しました。`);

  // 親コンポーネントに作成したデータを渡す
  emit("create", newInstanceType.value);

  // モーダルを閉じる
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
</style>
