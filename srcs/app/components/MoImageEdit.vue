<template>
  <BaseModal :show="show" title="イメージ編集" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="modal-space">
      <FormSection>
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
      </FormSection>
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isUpdating"
        >
          {{ isUpdating ? "保存中..." : "保存" }}
        </button>
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
import FormSection from "~/components/Form/Section.vue";
import type { ImageServerBase } from "~~/shared/types/dto/image/ImageServerBase";
import FormTextarea from "~/components/Form/Textarea.vue";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  imageData: {
    type: Object as PropType<ImageServerBase | null>,
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
  onFormSubmit,
} = useImageEditForm(props);

const submitForm = onFormSubmit(emit);
</script>
