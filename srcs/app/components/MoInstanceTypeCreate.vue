<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの新規作成"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 名前 -->
      <div>
        <label for="it-name" class="form-label">名前</label>
        <input
          id="it-name"
          v-model="form.name"
          type="text"
          class="form-input"
          required
        />
      </div>
      <!-- CPUコア数 -->
      <div>
        <label for="it-cpu" class="form-label">CPUコア数</label>
        <input
          id="it-cpu"
          v-model.number="form.cpuCores"
          type="number"
          min="0"
          class="form-input"
          required
        />
      </div>
      <!-- メモリサイズ(GB) -->
      <div>
        <label for="it-memory" class="form-label">メモリサイズ (GB)</label>
        <input
          id="it-memory"
          v-model.number="form.memorySize"
          type="number"
          min="0"
          class="form-input"
          required
        />
      </div>
      <!-- ストレージサイズ(GB) -->
      <div>
        <label for="it-storage" class="form-label">ストレージサイズ (GB)</label>
        <input
          id="it-storage"
          v-model.number="form.storageSize"
          type="number"
          min="0"
          class="form-input"
          required
        />
      </div>

      <!-- ボタンエリア -->
      <div class="flex justify-end items-center gap-4 pt-4 border-t">
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

defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "success"]);

// "instance-types"リソースを作成するための専門家を呼び出す
const { executeCreate, isCreating } = useResourceCreate<
  InstanceTypeCreateRequestDTO,
  ModelInstanceTypeDTO
>("instance-types");
const { addToast } = useToast();

// フォームの入力値を保持するリアクティブなオブジェクト
const form = ref<InstanceTypeCreateRequestDTO>({
  name: "",
  cpuCores: 0,
  memorySize: 0,
  storageSize: 0,
});

/** フォーム送信時の処理 */
const handleSubmit = async () => {
  const result = await executeCreate(form.value);

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
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 rounded-md disabled:opacity-50;
}
.btn-primary {
  @apply py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50;
}
</style>
