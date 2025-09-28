<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの追加"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- インスタンスタイプ名-->
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
            required
          />
        </div>
        <!-- CPUコア数 -->
        <div>
          <label for="instance-vcpu" class="form-label">CPUコア数</label>
          <input
            id="instance-vcpu"
            type="number"
            v-model.number="newInstanceType.vcpus"
            class="form-input"
            placeholder="例: 16"
            min="1"
            required
          />
        </div>
        <!-- メモリ数 -->
        <div>
          <label for="instance-memory" class="form-label">メモリ数</label>
          <div class="flex items-center gap-2">
            <input
              id="instance-memory"
              type="number"
              v-model.number="newInstanceType.memory"
              class="form-input"
              placeholder="例: 32"
              min="1"
              required
            />
            <span class="font-semibold text-gray-600">GB</span>
          </div>
        </div>
        <!-- ストレージ数 -->
        <div>
          <label for="instance-storage" class="form-label">ストレージ数</label>
          <div class="flex items-center gap-2">
            <input
              id="instance-storage"
              type="number"
              v-model.number="newInstanceType.storage"
              class="form-input"
              placeholder="例: 500"
              min="1"
              required
            />
            <span class="font-semibold text-gray-600">GB</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
          :disabled="isCreating"
        >
          キャンセル
        </button>
        <button type="submit" class="btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
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

const emit = defineEmits(["close", "success"]);

// ==============================================================================
// executer & toast
// API通信や通知のためのユーティリティを準備
// ==============================================================================
const { executeCreate, isCreating } = useResourceCreate<
  InstanceTypeCreateRequestDTO,
  ModelInstanceTypeDTO
>("instance-types");
const { addToast } = useToast();

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
const handleSubmit = async () => {
  // formのrequiredがあるのでnullは絶対に来ないはず
  const value: InstanceTypeCreateRequestDTO = {
    name: newInstanceType.value.name,
    cpuCores: newInstanceType.value.vcpus!,
    memorySize: newInstanceType.value.memory!,
    storageSize: newInstanceType.value.storage!,
  };
  // 非同期でインスタンスタイプを作成
  const result = await executeCreate(value);

  // 作成が成功した場合
  if (result.success) {
    // 成功したら、親に@successイベントで通知
    useToast().addToast({
      type: "success",
      message: "インスタンスタイプが作成されました",
    });
    emit("success");
  } else {
    // 失敗したら、このモーダル自身がエラーを通知
    addToast({
      type: "error",
      message: "インスタンスタイプの作成に失敗しました。",
      details: result.error?.message,
    });
  }
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
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 rounded-md disabled:opacity-50;
}
</style>
