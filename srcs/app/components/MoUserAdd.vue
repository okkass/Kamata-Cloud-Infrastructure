<template>
  <BaseModal :show="show" title="利用者の追加" @close="handleClose">
    <form id="user-add-form" @submit.prevent="onSubmit">
      <FormSection title="基本情報">
        <FormInput
          label="アカウント名"
          name="user-account-name-add"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />
        <FormInput
          label="メールアドレス"
          name="user-email-add"
          type="email"
          v-model="email"
          v-bind="emailAttrs"
          :error="errors.email"
          :required="true"
        />
        <FormInput
          label="パスワード"
          name="user-password-add"
          type="password"
          v-model="password"
          v-bind="passwordAttrs"
          :error="errors.password"
          :required="true"
        />
      </FormSection>

      <FormSection title="リソースクォータ (上限なしの場合は空欄)">
        <FormInput
          label="最大vCPU (コア)"
          name="user-max-cpu-add"
          type="number"
          v-model.number="maxCpuCore"
          v-bind="maxCpuCoreAttrs"
          :error="errors.maxCpuCore"
          min="1"
        />
        <FormInput
          label="最大メモリ (MB)"
          name="user-max-memory-add"
          type="number"
          v-model.number="maxMemorySize"
          v-bind="maxMemorySizeAttrs"
          :error="errors.maxMemorySize"
          min="1"
        />
        <FormInput
          label="最大ストレージ (GB)"
          name="user-max-storage-add"
          type="number"
          v-model.number="maxStorageSize"
          v-bind="maxStorageSizeAttrs"
          :error="errors.maxStorageSize"
          min="1"
        />
      </FormSection>

      <FormSection title="管理者権限">
        <div class="checkbox-grid">
          <label
            v-for="(perm, index) in permissions"
            :key="index"
            class="checkbox-label"
          >
            <input type="checkbox" v-model="perm.value" />
            {{ perm.label }}
          </label>
        </div>
      </FormSection>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          form="user-add-form"
          type="submit"
          label="利用者を追加"
          :disabled="!isValid"
          :loading="isCreating"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 利用者追加モーダル (MoUserAdd.vue)
 * =================================================================================
 */
import { useUserAddForm } from "~/composables/modal/useUserAddForm";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors,
  isValid,
  // フォームフィールド群
  name,
  nameAttrs,
  email,
  emailAttrs,
  password,
  passwordAttrs,
  maxCpuCore,
  maxCpuCoreAttrs,
  maxMemorySize,
  maxMemorySizeAttrs,
  maxStorageSize,
  maxStorageSizeAttrs,
  permissions,
  // 状態とアクション
  isCreating,
  onFormSubmit,
  makeHandleClose,
} = useUserAddForm();
const handleClose = makeHandleClose(emit);
const onSubmit = onFormSubmit(emit);
</script>

<style scoped>
/* ★ チェックボックス用の簡易グリッド */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem; /* rounded-md */
  border: 1px solid #e5e7eb; /* border-gray-200 */
  cursor: pointer;
}
.checkbox-label:hover {
  background-color: #f9fafb; /* bg-gray-50 */
}
.checkbox-label input {
  width: 1rem;
  height: 1rem;
}
</style>
