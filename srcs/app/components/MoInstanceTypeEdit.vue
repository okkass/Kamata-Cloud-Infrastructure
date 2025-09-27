<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの編集"
    @close="$emit('close')"
  >
    <form v-if="formData" @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 名前 -->
      <div>
        <label for="it-edit-name" class="form-label">名前</label>
        <input
          id="it-edit-name"
          v-model="formData.name"
          type="text"
          class="form-input"
          required
        />
      </div>
      <!-- CPUコア数 -->
      <div>
        <label for="it-edit-cpu" class="form-label">CPUコア数</label>
        <input
          id="it-edit-cpu"
          v-model.number="formData.cpuCores"
          type="number"
          min="0"
          class="form-input"
          required
        />
      </div>
      <!-- メモリサイズ(GB) -->
      <div>
        <label for="it-edit-memory" class="form-label">メモリサイズ (GB)</label>
        <input
          id="it-edit-memory"
          v-model.number="formData.memorySize"
          type="number"
          min="0"
          class="form-input"
          required
        />
      </div>
      <!-- ストレージサイズ(GB) -->
      <div>
        <label for="it-edit-storage" class="form-label"
          >ストレージサイズ (GB)</label
        >
        <input
          id="it-edit-storage"
          v-model.number="formData.storageSize"
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
          :disabled="isLoading"
        >
          キャンセル
        </button>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? "保存中..." : "保存" }}
        </button>
      </div>
    </form>
    <div v-else class="text-center">
      <p>編集するデータを読み込めませんでした。</p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import type { InstanceTypePayload, InstanceTypeDTO } from "~/types";

const props = defineProps({
  show: { type: Boolean, required: true },
  // 親から渡される、編集対象の現在のデータ
  instanceTypeData: {
    type: Object as PropType<InstanceTypeDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// "instance-types"リソースを更新するための専門家を呼び出す
const { executeUpdate, isUpdating } = useResourceUpdate<
  InstanceTypePayload,
  InstanceTypeDTO
>("instance-types");
const toast = useToast();

// フォームの入力値を保持するref。propsのデータを直接変更しないようにコピーして使う
const formData = ref<InstanceTypePayload | null>(null);

// props.instanceTypeDataが変更されたら、フォームのデータを更新する
watch(
  () => props.instanceTypeData,
  (newData) => {
    if (newData) {
      // スプレッド構文でオブジェクトをコピーし、リアクティブな関連を切る
      formData.value = { ...newData };
    } else {
      formData.value = null;
    }
  },
  { immediate: true }
); // immediate: trueでコンポーネント初期化時にも実行

/** フォーム送信時の処理 */
const handleSubmit = async () => {
  if (!props.instanceTypeData || !formData.value) return;

  // 専門家(executeUpdate)に更新処理を依頼
  const result = await executeUpdate(props.instanceTypeData.id, formData.value);

  if (result.success) {
    toast.addToast({
      type: "success",
      message: `'${result.data?.name}' の更新に成功しました。`,
    });
    emit("success");
  } else {
    toast.addToast({
      type: "error",
      message: "更新に失敗しました。",
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
