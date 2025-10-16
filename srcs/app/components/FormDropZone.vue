<template>
  <div>
    <label class="form-label">{{ label }}</label>
    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleFileDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        class="sr-only"
        @change="handleFileSelect"
        :accept="accept"
      />
      <div class="text-center">
        <IconUpload class="mx-auto h-12 w-12 text-gray-400" />

        <div class="mt-4 flex text-sm text-gray-600">
          <p
            class="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500"
          >
            ファイルを選択
          </p>
          <p class="pl-1">、またはドラッグ＆ドロップ</p>
        </div>

        <p class="text-xs text-gray-500 mt-1">対応形式: {{ accept }}</p>

        <p v-if="modelValue" class="text-sm font-semibold text-green-600 mt-2">
          選択中のファイル: {{ modelValue.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ファイルドラッグ＆ドロップコンポーネント (FormDropZone.vue)
 * ---------------------------------------------------------------------------------
 * ファイルのドラッグ＆ドロップと、クリックによるファイル選択機能を提供します。
 * 選択されたファイルはv-modelを通じて親コンポーネントと同期されます。
 * ファイル形式の簡易的なバリデーションも内蔵しています。
 * =================================================================================
 */
import { ref } from "vue";
import { useToast } from "~/composables/useToast";

// --- Props & Emits ---
const props = defineProps({
  label: {
    type: String,
    default: "ファイルアップロード",
  },
  accept: {
    type: String,
    default: "*/*", // デフォルトでは全てのファイル形式を許可
  },
});

// v-modelで親コンポーネントとFileオブジェクトを同期
const modelValue = defineModel<File | null>();

// --- State ---
const fileInput = ref<HTMLInputElement | null>(null); // <input type="file">への参照
const isDragging = ref(false); // ドラッグ状態の管理
const { addToast } = useToast();

/**
 * ==============================================================================
 * Methods (メソッド)
 * ==============================================================================
 */

/**
 * 非表示の<input type="file">をクリックさせ、ファイル選択ダイアログを開きます。
 */
const openFilePicker = () => {
  fileInput.value?.click();
};

/**
 * 渡されたファイルを検証し、v-modelを更新します。
 * @param {File | null} file - 検証対象のファイル
 */
const validateAndSetFile = (file: File | null) => {
  // ファイルが指定されていない場合は何もしない
  if (!file) return;

  // ファイル形式(accept)の検証
  const acceptedTypes = props.accept.split(",").map((t) => t.trim());
  const fileExtension = `.${file.name.split(".").pop()}`;

  if (props.accept !== "*/*" && !acceptedTypes.includes(fileExtension)) {
    addToast({
      message: `無効なファイル形式です。${props.accept} ファイルを選択してください。`,
      type: "error",
    });
    // v-modelとinput要素の値をリセット
    modelValue.value = null;
    if (fileInput.value) fileInput.value.value = "";
    return;
  }
  // 検証をパスしたらv-modelを更新
  modelValue.value = file;
};

/**
 * ファイル選択ダイアログでファイルが選ばれたときに呼ばれるハンドラ。
 * @param {Event} event - input要素のchangeイベント
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  validateAndSetFile(target.files?.[0] || null);
};

/**
 * エリアにファイルがドロップされたときに呼ばれるハンドラ。
 * @param {DragEvent} event - dropイベント
 */
const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  validateAndSetFile(event.dataTransfer?.files?.[0] || null);
};
</script>

<style scoped>
/* スタイルは変更なし、このコンポーネント専用なのでscopedが適切です */
.drop-zone {
  @apply mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 
         cursor-pointer transition-colors hover:border-gray-400;
}
.drop-zone.is-dragging {
  @apply border-blue-500 bg-blue-50/60;
}
</style>
