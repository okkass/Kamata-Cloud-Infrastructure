<template>
  <div class="modal-space">
    <div>
      <label for="os-image-select" class="form-label">
        OSイメージ <span class="required-asterisk">*</span>
      </label>
      <div v-if="imagesPending" class="text-loading">読み込み中...</div>
      <div v-else-if="imagesError" class="text-error">取得に失敗しました。</div>
      <select
        v-else
        id="os-image-select"
        v-model="osImageId"
        v-bind="osImageIdAttrs"
        class="form-input"
        :class="{ 'form-border-error': errors.osImageId }"
      >
        <option :value="undefined" disabled>
          OSイメージを選択してください
        </option>
        <option v-for="image in osImages" :key="image.id" :value="image.id">
          {{ image.name }}
        </option>
      </select>
      <p v-if="errors.osImageId" class="text-error mt-1">
        {{ errors.osImageId }}
      </p>
    </div>

    <div>
      <label for="middleware-select" class="form-label">ミドルウェア</label>
      <div v-if="middlewaresPending" class="text-loading">読み込み中...</div>
      <div v-else-if="middlewaresError" class="text-error">
        取得に失敗しました。
      </div>
      <select
        v-else
        id="middleware-select"
        v-model="middlewareId"
        v-bind="middlewareIdAttrs"
        class="form-input"
        :class="{ 'form-border-error': errors.middlewareId }"
      >
        <option :value="null">なし</option>
        <option v-for="mw in middlewares" :key="mw.id" :value="mw.id">
          {{ mw.name }}
        </option>
      </select>
      <p v-if="errors.middlewareId" class="text-error mt-1">
        {{ errors.middlewareId }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// Type Definitions
// APIから取得するデータの型を定義します。
// ==============================================================================
interface ImageDTO {
  id: string;
  name: string;
}
interface MiddleWareDTO {
  id: string;
  name: string;
}

// ==============================================================================
// Validation Schema
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // osImageIdは文字列であり、選択が必須であることを定義します。
    osImageId: z.string({ required_error: "OSイメージを選択してください。" }),
    // middlewareIdは文字列またはnullを許容する任意項目です。
    middlewareId: z.string().nullable(),
  })
);

// ==============================================================================
// Form Setup
// VeeValidateのuseFormを使って、フォームの状態管理をセットアップします。
// ==============================================================================
const { errors, defineField, values, meta } = useForm({
  validationSchema,
  initialValues: {
    osImageId: undefined, // 必須項目はundefinedで初期化し、プレースホルダーを表示させます。
    middlewareId: null, // 任意項目はnullで初期化し、「なし」を選択状態にします。
  },
});

// `defineField`を使って、各フォームフィールドとVeeValidateを連携させます。
const [osImageId, osImageIdAttrs] = defineField("osImageId");
const [middlewareId, middlewareIdAttrs] = defineField("middlewareId");

// 親コンポーネント(MoVirtualMachineCreate)がこのタブのデータと状態を参照できるように公開します。
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API Data Fetching
// `useResourceList` Composableを使って、プルダウンの選択肢をAPIから取得します。
// ==============================================================================
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
