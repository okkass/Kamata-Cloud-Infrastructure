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
        v-model="osImageId"
        v-bind="osImageIdAttrs"
        class="form-input"
        :class="{ 'border-red-500': errors.osImageId }"
      >
        <option :value="undefined" disabled>
          OSイメージを選択してください
        </option>
        <option v-for="image in osImages" :key="image.id" :value="image.id">
          {{ image.name }}
        </option>
      </select>
      <p v-if="errors.osImageId" class="text-red-500 text-sm mt-1">
        {{ errors.osImageId }}
      </p>
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
        v-model="middlewareId"
        v-bind="middlewareIdAttrs"
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
import { useResourceList } from "~/composables/useResourceList";
// ★ 1. VeeValidateとZod関連の機能をインポート
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// 型定義 (変更なし)
// ==============================================================================
interface ModelOsImageDTO {
  id: string;
  name: string;
}
interface ModelMiddlewareDTO {
  id: string;
  name: string;
}

// ★ 2. Zodでバリデーションスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    // `osImageId` は文字列であることが必須
    osImageId: z.string({ required_error: "OSイメージを選択してください。" }),
    // `middlewareId` は文字列またはnullを許容する（任意項目）
    middlewareId: z.string().nullable(),
  })
);

// ★ 3. `useForm` をセットアップ
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    osImageId: undefined, // 必須項目は undefined で初期化
    middlewareId: null,
  },
});

const [osImageId, osImageIdAttrs] = defineField("osImageId");
const [middlewareId, middlewareIdAttrs] = defineField("middlewareId");

// --- 親コンポーネントへの公開 ---
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API連携 (変更なし)
// ==============================================================================
const {
  data: osImages,
  pending: imagesPending,
  error: imagesError,
} = useResourceList<ModelOsImageDTO>("image");

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
