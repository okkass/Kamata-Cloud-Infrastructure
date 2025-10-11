<template>
  <div>
    <label class="form-label">公開鍵ファイル</label>
    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        class="sr-only"
        @change="handleFileSelect"
        accept=".pub"
      />
      <div class="text-center">
        <IconUpload />
        <div class="mt-4 flex text-sm text-gray-600">
          <p
            class="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500"
          >
            ファイルを選択
          </p>
          <p class="pl-1">、またはドラッグ＆ドロップ</p>
        </div>
        <p class="text-xs text-gray-500 mt-1">対応形式: .pub</p>
        <p v-if="modelValue" class="text-sm font-semibold text-green-600 mt-2">
          選択中のファイル: {{ modelValue.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
    if (fileInput.value) fileInput.value.value = "";
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
  @apply mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 
         cursor-pointer transition-colors hover:border-gray-400;
}
.drop-zone.is-dragging {
  @apply border-blue-500 bg-blue-50/60;
}
</style>
