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

        <div>
          <label for="image-description-edit" class="form-label-sm">説明</label>
          <textarea
            id="image-description-edit"
            rows="3"
            v-model="description"
            v-bind="descriptionAttrs"
            class="form-input"
            :class="{ 'form-border-error': errors.description }"
            placeholder="イメージの説明を入力してください"
          ></textarea>
          <p class="text-error h-5">
            {{ errors.description || "&nbsp;" }}
          </p>
        </div>
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
import {
  useImageEditForm,
  type ImageDTO,
} from "~/composables/modal/useImageEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  imageData: {
    type: Object as PropType<ImageDTO | null>,
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
