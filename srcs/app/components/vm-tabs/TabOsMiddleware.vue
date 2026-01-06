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
import { vmOsMiddlewareCreateSchema } from "~/utils/validations/virtual-machine";

import FormSelect from "~/components/Form/Select.vue";

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(vmOsMiddlewareCreateSchema);

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
} = useResourceList<ImageResponse>(IMAGE.name);

// 2. ミドルウェア
const {
  data: middlewares,
  pending: middlewaresPending,
  error: middlewaresError,
} = useResourceList<MiddlewareResponse>(MIDDLEWARE.name);

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
