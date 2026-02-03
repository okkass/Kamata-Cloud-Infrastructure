<template>
  <BaseModal :show="show" title="イメージ追加" @close="handleClose">
    <form id="image-add-form" @submit.prevent="onSubmit" class="modal-space">
      <FormInput
        label="イメージ名"
        name="image-name-add"
        type="text"
        placeholder="例: ubuntu-24.04-amd64"
        v-model="name"
        v-bind="nameAttrs"
        :error="errors.name"
        :required="true"
      />

      <FormSelect
        label="作成先ストレージプール"
        name="image-storage-add"
        :options="storagePools ?? []"
        option-label="name"
        option-value="id"
        placeholder="ストレージプールを選択してください"
        :required="true"
        :pending="storagePoolsPending"
        :error="storagePoolsError"
        :error-message="errors.storagePoolId"
        v-model="storagePoolId"
        v-bind="storagePoolIdAttrs"
      />

      <FormDropZone
        id="image-file-add"
        v-model="file"
        accept=".img,.qcow2,.zip,.gz,.xz,.iso"
        :required="true"
        label="ファイルアップロード"
        :error-message="errors.file"
      />

      <FormInput
        label="説明"
        name="image-description-add"
        v-model="description"
        v-bind="descriptionAttrs"
        :error="errors.description"
        placeholder="イメージの説明を入力してください"
      />
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="イメージを追加"
          form="image-add-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * イメージ追加モーダル (MoImageAdd.vue)
 * =================================================================================
 */
import { useImageAddForm } from "~/composables/modal/useImageAddForm";
import FormInput from "~/components/Form/Input.vue";
import FormDropZone from "~/components/Form/DropZone.vue";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックを取得 ---
const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  file,
  // ★ ストレージプール関連
  storagePoolId,
  storagePoolIdAttrs,
  storagePools,
  storagePoolsPending,
  storagePoolsError,

  isValid,
  isCreating,
  onFormSubmit,
  makeHandleClose,
} = useImageAddForm();
const onSubmit = onFormSubmit(emit);
const handleClose = makeHandleClose(emit);
</script>
