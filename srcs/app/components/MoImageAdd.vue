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

      <div
        v-if="selectedStoragePool"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="font-medium text-gray-600">利用可能容量</span>
          <span class="font-bold text-blue-600">
            {{ toSize(selectedStoragePool.availableSize) }}
          </span>
        </div>

        <div
          class="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
        >
          <div
            class="h-full rounded-full bg-blue-500 transition-all duration-300"
            :style="{
              width: `${(selectedStoragePool.usedSize / selectedStoragePool.totalSize) * 100}%`,
            }"
          ></div>
        </div>

        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>使用中: {{ toSize(selectedStoragePool.usedSize) }}</span>
          <span>合計: {{ toSize(selectedStoragePool.totalSize) }}</span>
        </div>
      </div>

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
  selectedStoragePool,

  isValid,
  isCreating,
  onFormSubmit,
  makeHandleClose,
} = useImageAddForm();
const onSubmit = onFormSubmit(emit);
const handleClose = makeHandleClose(emit);
</script>
