<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの編集"
    @close="$emit('close')"
  >
    <form v-if="editableInstanceType" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- インスタンスタイプ名-->
        <div>
          <label for="instance-type-name-edit" class="form-label"
            >インスタンスタイプ名</label
          >
          <input
            id="instance-type-name-edit"
            type="text"
            v-model="editableInstanceType.name"
            class="form-input"
            placeholder="例: standard.xlarge"
          />
        </div>
        <!-- vCPU数 -->
        <div>
          <label for="instance-vcpu-edit" class="form-label">CPUコア数</label>
          <input
            id="instance-vcpu-edit"
            type="number"
            v-model.number="editableInstanceType.cpuCores"
            class="form-input"
            placeholder="例: 16"
          />
        </div>
        <!-- メモリ数 -->
        <div>
          <label for="instance-memory-edit" class="form-label">メモリ数</label>
          <div class="flex items-center gap-2">
            <input
              id="instance-memory-edit"
              type="number"
              v-model.number="editableInstanceType.memorySize"
              class="form-input"
              placeholder="例: 32"
            />
            <span class="font-semibold text-gray-600">GB</span>
          </div>
        </div>
        <!-- ストレージ数 -->
        <div>
          <label for="instance-storage-edit" class="form-label"
            >ストレージ数</label
          >
          <div class="flex items-center gap-2">
            <input
              id="instance-storage-edit"
              type="number"
              v-model.number="editableInstanceType.storageSize"
              class="form-input"
              placeholder="例: 500"
            />
            <span class="font-semibold text-gray-600">GB</span>
          </div>
        </div>
      </div>
      <!-- ボタンエリア -->
      <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
          :disabled="isUpdating"
        >
          キャンセル
        </button>
        <button type="submit" class="btn-primary" :disabled="isUpdating">
          {{ isUpdating ? "保存中..." : "保存" }}
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

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  // モーダルの表示状態
  show: {
    type: Boolean,
    required: true,
  },
  // APIから取得した編集対象のインスタンスタイプデータ
  instanceTypeData: {
    type: Object as PropType<ModelInstanceTypeDTO | null>,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Composables
// ==============================================================================
// "instance-types"リソースを更新するための専門家を呼び出す
const { executeUpdate, isUpdating } = useResourceUpdate<
  InstanceTypeUpdateRequestDTO,
  ModelInstanceTypeDTO
>("instance-types");
// トースト通知用のComposable
const toast = useToast();

// ==============================================================================
// State
// ==============================================================================
// propsで受け取ったデータを編集するためのローカルコピーを作成
const editableInstanceType = ref<InstanceTypeUpdateRequestDTO | null>(null);

// 親コンポーネントから渡されるデータが変更された場合に、ローカルのデータも追従させる
watch(
  () => props.instanceTypeData,
  (newData) => {
    if (newData) {
      editableInstanceType.value = { ...newData };
    } else {
      editableInstanceType.value = null;
    }
  },
  { immediate: true }
); // immediate: trueで初期化時にも実行

// ==============================================================================
// Methods
// ==============================================================================
/**
 * 変更を保存する処理
 */
const handleSubmit = async () => {
  if (!props.instanceTypeData || !editableInstanceType.value) {
    // 編集対象のデータがない場合は何もしない
    return;
  }
  // 専門家(executeUpdate)に更新処理を依頼
  const result = await executeUpdate(
    props.instanceTypeData.id,
    editableInstanceType.value
  );

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
