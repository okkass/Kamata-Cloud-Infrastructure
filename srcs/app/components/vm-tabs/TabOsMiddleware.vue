<template>
  <div class="modal-space">
    <FormSelect
      label="OSイメージ"
      name="os-image-select"
      :pending="imagesPending"
      :error="imagesError"
      :options="osImages ?? []"
      placeholder="OSイメージを選択してください"
      :required="true"
      :error-message="errors.osImageId"
      :placeholder-value="undefined"
      v-model="osImageId"
      v-model:attrs="osImageIdAttrs"
    />

    <FormSelect
      label="ミドルウェア"
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
/**
 * =================================================================================
 * OS/ミドルウェア タブ (TabOsMiddleware.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードのOSとミドルウェアを選択するタブ。
 * =================================================================================
 */
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

/**
 * ==============================================================================
 * Validation Schema (バリデーションスキーマ)
 * ------------------------------------------------------------------------------
 * このフォームの入力ルールをZodで定義します。
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    osImageId: z.string({ required_error: "OSイメージを選択してください。" }),
    middlewareId: z.string().nullable(),
  })
);

/**
 * ==============================================================================
 * Form State Management (フォーム状態管理)
 * ------------------------------------------------------------------------------
 * VeeValidateのuseFormを使い、このタブのフォーム状態を管理します。
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    osImageId: undefined, // 必須項目はundefinedで初期化し、プレースホルダーを表示
    middlewareId: null, // 任意項目はnullで初期化し、「なし」を選択状態に
  },
});

// 各フォームフィールドとVeeValidateを連携
const [osImageId, osImageIdAttrs] = defineField("osImageId");
const [middlewareId, middlewareIdAttrs] = defineField("middlewareId");

// 親コンポーネントにフォームデータと状態を公開
defineExpose({ formData: values, isValid: meta });

/**
 * ==============================================================================
 * API Data Fetching (APIデータ取得)
 * ------------------------------------------------------------------------------
 * プルダウンの選択肢をAPIから非同期で取得します。
 * ==============================================================================
 */
const {
  data: osImages,
  pending: imagesPending,
  error: imagesError,
} = useResourceList<ImageDTO>("images");
const {
  data: middlewares,
  pending: middlewaresPending,
  error: middlewaresError,
} = useResourceList<MiddleWareDTO>("middlewares");
</script>
