<template>
  <div class="space-y-4">
    <div>
      <label for="os-image-select" class="form-label">OSイメージ</label>
      <div v-if="imagesPending" class="text-gray-500">
        OSイメージ一覧を読み込み中...
      </div>
      <div v-else-if="imagesError" class="text-red-500">
        OSイメージ一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="os-image-select"
        v-model="formData.osImageId"
        class="form-input"
      >
        <option :value="null" disabled>OSイメージを選択してください</option>
        <option v-for="image in osImages" :key="image.id" :value="image.id">
          {{ image.name }}
        </option>
      </select>
    </div>

    <div>
      <label for="middleware-select" class="form-label">ミドルウェア選択</label>
      <div v-if="middlewaresPending" class="text-gray-500">
        ミドルウェア一覧を読み込み中...
      </div>
      <div v-else-if="middlewaresError" class="text-red-500">
        ミドルウェア一覧の取得に失敗しました。
      </div>
      <select
        v-else
        id="middleware-select"
        v-model="formData.middlewareId"
        class="form-input"
      >
        <option :value="null">なし</option>
        <option v-for="mw in middlewares" :key="mw.id" :value="mw.id">
          {{ mw.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useResourceList } from "~/composables/useResourceList";

// ==============================================================================
// 型定義 (本来は types/dto.ts などからインポート)
// ==============================================================================
interface ModelOsImageDTO {
  id: string;
  name: string;
}
interface ModelMiddlewareDTO {
  id: string;
  name: string;
}

// ==============================================================================
// フォームの入力データ
// ==============================================================================
const formData = ref({
  osImageId: null,
  middlewareId: null,
});

// --- 親コンポーネントがこのタブのデータにアクセスできるように公開 (変更不要) ---
defineExpose({ formData });

// ==============================================================================
// API連携
// ==============================================================================
// --- OSイメージ一覧の取得 ---
const {
  data: osImages,
  pending: imagesPending,
  error: imagesError,
} = useResourceList<ModelOsImageDTO>("image");

// --- ミドルウェア一覧の取得 ---
const {
  data: middlewares,
  pending: middlewaresPending,
  error: middlewaresError,
} = useResourceList<ModelMiddlewareDTO>("middleware");
</script>

<style scoped>
/* (スタイルは変更なし) */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
</style>
