<template>
  <BaseModal :show="show" title="イメージ編集" @close="handleClose">
    <form id="image-edit-form" @submit.prevent="submitForm" class="modal-space">
      <FormInput
        label="イメージ名"
        name="image-name-edit"
        type="text"
        v-model="name"
        v-bind="nameAttrs"
        :error="errors.name"
        :required="true"
      />

      <FormTextarea
        label="説明"
        name="image-description-edit"
        :rows="3"
        v-model="description"
        v-bind="descriptionAttrs"
        :error="errors.description"
        placeholder="イメージの説明を入力してください"
      />
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="!isValid || isUpdating"
          :loading="isUpdating"
          label="イメージの更新"
          form="image-edit-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * イメージ編集モーダル (MoImageEdit.vue)
 * =================================================================================
 */
import { useImageEditForm } from "~/composables/modal/useImageEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  imageData: {
    type: Object as PropType<ImageResponse | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックを取得 ---
const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  isUpdating,
  isValid,
  onFormSubmit,
  makeHandleClose,
} = useImageEditForm(props);

const submitForm = onFormSubmit(emit);
const handleClose = makeHandleClose(emit);
</script>
