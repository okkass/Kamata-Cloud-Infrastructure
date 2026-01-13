<template>
  <div class="py-2">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
        <h1 class="text-2xl font-bold text-gray-900">ユーザー設定</h1>

        <form id="user-settings-form" @submit.prevent="submitForm">
          <!-- 基本情報 -->
          <FormSection title="基本情報">
            <FormInput
              label="ユーザー名"
              name="settings-user-name"
              type="text"
              v-model="name"
              v-bind="nameAttrs"
              :error="errors.name"
              :required="true"
            />
            <FormInput
              label="メールアドレス"
              name="settings-user-email"
              type="email"
              v-model="email"
              v-bind="emailAttrs"
              :error="errors.email"
              :required="true"
            />
          </FormSection>

          <!-- パスワード変更 -->
          <div class="mt-2">
            <FormSection title="パスワード変更">
              <p class="text-sm text-gray-500 mb-4">
                パスワードを変更しない場合は、以下を空欄のままにしてください。
              </p>

              <!-- 現在のパスワード -->
              <div class="relative">
                <FormInput
                  label="現在のパスワード"
                  name="settings-current-password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="currentPassword"
                  v-bind="currentPasswordAttrs"
                  :error="errors.currentPassword"
                  :required="wantsPasswordChange"
                />
                <button
                  type="button"
                  class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  {{ showCurrentPassword ? "隠す" : "表示" }}
                </button>
              </div>

              <!-- 新しいパスワード -->
              <div class="relative">
                <FormInput
                  label="新しいパスワード"
                  name="settings-new-password"
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="newPassword"
                  v-bind="newPasswordAttrs"
                  :error="errors.newPassword"
                  :required="wantsPasswordChange"
                />
                <button
                  type="button"
                  class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"
                  @click="showNewPassword = !showNewPassword"
                >
                  {{ showNewPassword ? "隠す" : "表示" }}
                </button>
              </div>

              <!-- 新しいパスワード（確認） -->
              <div class="relative">
                <FormInput
                  label="新しいパスワード（確認）"
                  name="settings-new-password-confirm"
                  :type="showNewPasswordConfirm ? 'text' : 'password'"
                  v-model="newPasswordConfirm"
                  v-bind="newPasswordConfirmAttrs"
                  :error="errors.newPasswordConfirm"
                  :required="wantsPasswordChange"
                />
                <button
                  type="button"
                  class="absolute right-3 top-[38px] text-sm text-gray-600 hover:text-gray-900"
                  @click="showNewPasswordConfirm = !showNewPasswordConfirm"
                >
                  {{ showNewPasswordConfirm ? "隠す" : "表示" }}
                </button>
              </div>
            </FormSection>
          </div>
        </form>

        <div class="flex justify-end pt-4 border-t border-gray-200">
          <UiSubmitButton
            form="user-settings-form"
            type="submit"
            label="保存"
            :loading="isUpdating"
            :disabled="!isValid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FormInput from "~/components/Form/Input.vue";
import FormSection from "~/components/Form/Section.vue";
import { useUserSettingsForm } from "~/composables/useUserSettingsForm";

// ★ TODO: ログイン中ユーザー取得に差し替え
const me = ref({
  id: "me",
  name: "Alice",
  email: "sample@example.com",
});

// パスワード表示/非表示
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showNewPasswordConfirm = ref(false);

const {
  errors,
  isValid,

  name,
  nameAttrs,
  email,
  emailAttrs,

  currentPassword,
  currentPasswordAttrs,
  newPassword,
  newPasswordAttrs,
  newPasswordConfirm,
  newPasswordConfirmAttrs,

  wantsPasswordChange,

  isUpdating,
  onFormSubmit,
} = useUserSettingsForm({ data: me });

const submitForm = onFormSubmit();
</script>
