<template>
  <div class="modal-space space-y-4">
    <FormSelect
      label="OSイメージ"
      name="os-image-select"
      :options="osImages ?? []"
      option-label="name"
      option-value="id"
      :pending="imagesPending"
      :error="imagesError"
      placeholder="OSイメージを選択してください"
      :required="true"
      :error-message="errors.osImageId"
      v-model="osImageId"
      v-bind="osImageIdAttrs"
    />

    <FormSelect
      label="ミドルウェア"
      name="middleware-select"
      :options="middlewares ?? []"
      option-label="name"
      option-value="id"
      :pending="middlewaresPending"
      :error="middlewaresError"
      placeholder="なし"
      :error-message="errors.middlewareId"
      v-model="middlewareId"
      v-bind="middlewareIdAttrs"
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

import FormSelect from "~/components/Form/Select.vue";

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    osImageId: z
      .string({ message: "OSイメージを選択してください。" })
      .min(1, "OSイメージを選択してください。"),
    middlewareId: z.string().nullable(),
  })
);

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    osImageId: undefined,
    middlewareId: null,
  },
});

const [osImageId, osImageIdAttrs] = defineField("osImageId");
const [middlewareId, middlewareIdAttrs] = defineField("middlewareId");

/**
 * ==============================================================================
 * API Data Fetching
 * ==============================================================================
 */
// 1. OSイメージ
const {
  data: osImages,
  pending: imagesPending,
  error: imagesError,
} = useResourceList<ImageResponse>("images");

// 2. ミドルウェア
const {
  data: middlewares,
  pending: middlewaresPending,
  error: middlewaresError,
} = useResourceList<MiddlewareResponse>("middlewares");

/**
 * ==============================================================================
 * Expose
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
});
</script>

<style scoped>
.modal-space {
  @apply p-1;
}
</style>
