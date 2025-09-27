<template>
  <BaseModal
    :show="show"
    title="インスタンスタイプの編集"
    @close="$emit('close')"
  >
    <div class="space-y-4">
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

      <div>
        <label for="instance-vcpu-edit" class="form-label">vCPU数</label>
        <input
          id="instance-vcpu-edit"
          type="number"
          v-model.number="editableInstanceType.vcpus"
          class="form-input"
          placeholder="例: 16"
        />
      </div>

      <div>
        <label for="instance-memory-edit" class="form-label">メモリ数</label>
        <div class="flex items-center gap-2">
          <input
            id="instance-memory-edit"
            type="number"
            v-model.number="editableInstanceType.memory"
            class="form-input"
            placeholder="例: 32"
          />
          <span class="font-semibold text-gray-600">GB</span>
        </div>
      </div>

      <div>
        <label for="instance-storage-edit" class="form-label"
          >ストレージ数</label
        >
        <div class="flex items-center gap-2">
          <input
            id="instance-storage-edit"
            type="number"
            v-model.number="editableInstanceType.storage"
            class="form-input"
            placeholder="例: 500"
          />
          <span class="font-semibold text-gray-600">GB</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
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
  // モーダルの表示状態
  show: {
    type: Boolean,
    required: true,
  },
  // APIから取得した編集対象のインスタンスタイプデータ
  instanceTypeData: {
    type: Object,
    required: true,
    // 親からデータが渡されない場合のデフォルト値 (テスト用)
    default: () => ({
      id: "itype-001",
      name: "standard.medium",
      vcpus: 4,
      memory: 8,
      storage: 100,
    }),
  },
});

const emit = defineEmits(["close", "save"]);

// ==============================================================================
// State
// ==============================================================================
// propsで受け取ったデータを編集するためのローカルコピーを作成
const editableInstanceType = ref({ ...props.instanceTypeData });

// 親コンポーネントから渡されるデータが変更された場合に、ローカルのデータも追従させる
watch(
  () => props.instanceTypeData,
  (newData) => {
    editableInstanceType.value = { ...newData };
  }
);

// ==============================================================================
// Methods
// ==============================================================================
/**
 * 変更を保存する処理
 */
const saveChanges = () => {
  // 本来はここでAPIに editableInstanceType.value を送信する
  console.log("保存データ:", editableInstanceType.value);
  alert(`「${editableInstanceType.value.name}」の変更を保存しました。`);

  // 親コンポーネントに変更後のデータを渡す
  emit("save", editableInstanceType.value);

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
