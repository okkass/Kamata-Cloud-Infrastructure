<template>
  <BaseModal :show="show" title="利用者の編集" @close="$emit('close')">
    <form id="user-edit-form" @submit.prevent="submitForm">
      <FormSection title="基本情報">
        <FormInput
          label="アカウント名"
          name="user-account-name-edit"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />
        <FormInput
          label="メールアドレス"
          name="user-email-edit"
          type="email"
          v-model="email"
          v-bind="emailAttrs"
          :error="errors.email"
          :required="true"
        />
      </FormSection>

      <FormSection title="リソースクォータ (上限なしの場合は空欄)">
        <FormInput
          label="最大vCPU (コア)"
          name="user-max-cpu-edit"
          type="number"
          v-model.number="maxCpuCore"
          v-bind="maxCpuCoreAttrs"
          :error="errors.maxCpuCore"
          min="1"
        />
        <FormInput
          label="最大メモリ (MB)"
          name="user-max-memory-edit"
          type="number"
          v-model.number="maxMemorySize"
          v-bind="maxMemorySizeAttrs"
          :error="errors.maxMemorySize"
          min="1"
        />
        <FormInput
          label="最大ストレージ (GB)"
          name="user-max-storage-edit"
          type="number"
          v-model.number="maxStorageSize"
          v-bind="maxStorageSizeAttrs"
          :error="errors.maxStorageSize"
          min="1"
        />
      </FormSection>

      <FormSection title="管理者権限">
        <div class="checkbox-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isAdmin" v-bind="isAdminAttrs" />
            全体管理者
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isImageAdmin"
              v-bind="isImageAdminAttrs"
            />
            イメージ管理
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isInstanceTypeAdmin"
              v-bind="isInstanceTypeAdminAttrs"
            />
            インスタンスタイプ管理
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isNetworkAdmin"
              v-bind="isNetworkAdminAttrs"
            />
            ネットワーク管理
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isNodeAdmin"
              v-bind="isNodeAdminAttrs"
            />
            ノード管理
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isSecurityGroupAdmin"
              v-bind="isSecurityGroupAdminAttrs"
            />
            セキュリティグループ管理
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="isVirtualMachineAdmin"
              v-bind="isVirtualMachineAdminAttrs"
            />
            仮想マシン管理
          </label>
        </div>
      </FormSection>
    </form>

    <template #footer>
      <div class="modal-footer">
        <UiSubmitButton
          form="user-edit-form"
          type="submit"
          label="更新"
          :loading="isUpdating"
          :disabled="!isValid"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 利用者編集モーダル (MoUserEdit.vue)
 * =================================================================================
 */
import { useUserEditForm } from "~/composables/modal/useUserEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  data: {
    type: Object as PropType<UserResponse | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックを取得 ---
const {
  errors,
  isValid,
  name,
  nameAttrs,
  email,
  emailAttrs,
  maxCpuCore,
  maxCpuCoreAttrs,
  maxMemorySize,
  maxMemorySizeAttrs,
  maxStorageSize,
  maxStorageSizeAttrs,
  isAdmin,
  isAdminAttrs,
  isImageAdmin,
  isImageAdminAttrs,
  isInstanceTypeAdmin,
  isInstanceTypeAdminAttrs,
  isNetworkAdmin,
  isNetworkAdminAttrs,
  isNodeAdmin,
  isNodeAdminAttrs,
  isSecurityGroupAdmin,
  isSecurityGroupAdminAttrs,
  isVirtualMachineAdmin,
  isVirtualMachineAdminAttrs,
  isUpdating,
  onFormSubmit,
} = useUserEditForm(props);
const submitForm = onFormSubmit(emit);
</script>

<style scoped>
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
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}
.checkbox-label:hover {
  background-color: #f9fafb;
}
.checkbox-label input {
  width: 1rem;
  height: 1rem;
}
</style>
