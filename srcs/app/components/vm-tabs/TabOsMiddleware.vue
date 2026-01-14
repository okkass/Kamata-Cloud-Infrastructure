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
      :columns="['イメージ名', 'サイズ']"
      grid-template-columns="2fr 1fr"
      v-model="osImageId"
      v-bind="osImageIdAttrs"
    >
      <template #option="{ option }">
        <div
          class="grid gap-4 items-center w-full"
          style="grid-template-columns: 2fr 1fr"
        >
          <div>{{ option.name }}</div>
          <div class="text-sm text-gray-600">
            {{ formatImageSize(option.size) }}
          </div>
        </div>
      </template>
    </FormSelect>

    <FormSelect
      label="ミドルウェア"
      name="middleware-select"
      :options="middlewares ?? []"
      option-label="name"
      option-value="id"
      :pending="middlewaresPending"
      :error="middlewaresError"
      placeholder="なし"
      placeholder-value=""
      :error-message="errors.middlewareId"
      v-model="middlewareId"
      v-bind="middlewareIdAttrs"
    >
    </FormSelect>
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
import { formatImageSize } from "~/utils/format";

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
