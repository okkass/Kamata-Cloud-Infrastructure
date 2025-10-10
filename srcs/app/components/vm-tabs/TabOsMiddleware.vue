<template>
  <div class="modal-space">
    <FormSelect
      label="OSイメージ"
      name="os-image-select"
      :pending="imagesPending"
      :error="imagesError"
      :options="osImages ?? []"
      placeholder="OSイメージを選択してください"
      :error-message="errors.osImageId"
      :required="true"
      :placeholder-value="undefined"
      v-model="osImageId"
      v-model:attrs="osImageIdAttrs"
    />

    <FormSelect
      label="ミドルウェア選択"
      name="middleware-select"
      :pending="middlewaresPending"
      :error="middlewaresError"
      :options="middlewares ?? []"
      placeholder="なし"
      :error-message="errors.middlewareId"
      :placeholder-value="null"
      v-model="middlewareId"
      v-model:attrs="middlewareIdAttrs"
    />
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
// ★ 1. VeeValidateとZod関連の機能をインポート
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

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
} = useResourceList<ImageDTO>("image");

const {
  data: middlewares,
  pending: middlewaresPending,
  error: middlewaresError,
} = useResourceList<MiddleWareDTO>("middleware");
</script>
