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
          v-model.number="maxCpuCores"
          v-bind="maxCpuCoresAttrs"
          :error="errors.maxCpuCores"
          min="1"
        />
        <FormInput
          label="最大メモリ (MB)"
          name="user-max-memory-edit"
          type="number"
          v-model.number="maxMemorySizeInMb"
          v-bind="maxMemorySizeInMbAttrs"
          :error="errors.maxMemorySizeInMb"
          min="1"
        />
        <FormInput
          label="最大ストレージ (GB)"
          name="user-max-storage-edit"
          type="number"
          v-model.number="maxStorageSizeInGb"
          v-bind="maxStorageSizeInGbAttrs"
          :error="errors.maxStorageSizeInGb"
          min="1"
        />
      </FormSection>

      <FormSection title="管理者権限">
        <div class="checkbox-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isAdmin" />
            全体管理者
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isImageAdmin" />
            イメージ管理
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isInstanceTypeAdmin" />
            インスタンスタイプ管理
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isNetworkAdmin" />
            ネットワーク管理
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isNodeAdmin" />
            物理ノード管理
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isSecurityGroupAdmin" />
            セキュリティグループ管理
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="isVirtualMachineAdmin" />
            仮想マシン管理
          </label>
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
 * 利用者編集モーダル (MoUserEdit.vue)
 * =================================================================================
 */
import { useUserEditForm } from "~/composables/modal/useUserEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";

// ★ 指定された型定義をインポート
import type { UserServerBase } from "~~/shared/types/dto/user/UserServerBase";

// --- 親コンポーネントとの連携 ---
const props = defineProps({
  show: { type: Boolean, required: true },
  userData: {
    // ★ UserDTO -> UserServerBase に変更
    type: Object as PropType<UserServerBase | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックを取得 ---
const {
  errors,
  name,
  nameAttrs,
  email,
  emailAttrs,
  maxCpuCores,
  maxCpuCoresAttrs,
  maxMemorySizeInMb,
  maxMemorySizeInMbAttrs,
  maxStorageSizeInGb,
  maxStorageSizeInGbAttrs,
  isAdmin,
  isImageAdmin,
  isInstanceTypeAdmin,
  isNetworkAdmin,
  isNodeAdmin,
  isSecurityGroupAdmin,
  isVirtualMachineAdmin,
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
