<template>
  <div>
    <label class="form-label">キーペア (公開鍵)</label>
    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        class="hidden"
        accept=".pub"
      />
      <div class="text-center">
        <p class="text-gray-500">ここにファイルをドラッグ&ドロップ</p>
        <p class="text-gray-400 text-sm my-2">または</p>
        <button type="button" @click="openFilePicker" class="btn btn-add">
          ファイルを選択
        </button>
        <p v-if="modelValue" class="text-green-600 font-semibold mt-4">
          選択中のファイル: {{ modelValue.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "~/composables/useToast";

// v-modelで親コンポーネントとFileオブジェクトを同期
const modelValue = defineModel<File | null>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const { addToast } = useToast();

const openFilePicker = () => {
  fileInput.value?.click();
};

const validateAndSetFile = (file: File | null) => {
  if (file && !file.name.endsWith(".pub")) {
    addToast({
      message: "無効なファイル形式です。.pubファイルを選択してください。",
      type: "error",
    });
    modelValue.value = null;
    if (fileInput.value) fileInput.value.value = ""; // inputの選択をリセット
    return;
  }
  modelValue.value = file;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  validateAndSetFile(target.files?.[0] || null);
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  validateAndSetFile(event.dataTransfer?.files?.[0] || null);
};
</script>

<style scoped>
.drop-zone {
  @apply w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-colors;
}
.drop-zone.is-dragging {
  @apply border-blue-500 bg-blue-50;
}
</style>
