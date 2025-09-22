<template>
  <BaseModal :show="show" title="イメージ編集" @close="$emit('close')">
    <div class="space-y-4">
      <div>
        <label for="image-name" class="form-label">イメージ名</label>
        <input
          id="image-name"
          type="text"
          v-model="editableImage.name"
          class="form-input"
        />
      </div>

      <div>
        <label for="image-size" class="form-label">サイズ (GB)</label>
        <input
          id="image-size"
          type="number"
          v-model.number="editableImage.size"
          class="form-input"
          disabled
        />
      </div>

      <div>
        <label for="image-description" class="form-label">説明</label>
        <textarea
          id="image-description"
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

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  imageData: {
    type: Object,
    required: true,
    default: () => ({
      id: "img-001",
      name: "ubuntu-22.04-image",
      size: 8,
      description: "サンプルサンプルサンプルサンプル",
    }),
  },
});
const emit = defineEmits(["close", "save"]);

// ==============================================================================
// State
// ==============================================================================
const editableImage = ref({ ...props.imageData });

watch(
  () => props.imageData,
  (newData) => {
    editableImage.value = { ...newData };
  }
);

// ==============================================================================
// Methods
// ==============================================================================
const saveChanges = () => {
  console.log("保存データ:", editableImage.value);
  alert(`${editableImage.value.name} の変更を保存しました。`);
  emit("save", editableImage.value);
  emit("close");
};
</script>

<style scoped>
/* 共通スタイルを@applyで定義 */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  /*disabled状態のスタイルを追加 */
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
