<template>
  <BaseModal :show="show" title="利用者の追加" @close="$emit('close')">
    <!--
      @submit.prevent="submitForm" でフォーム送信時のデフォルト動作を抑制し、
      代わりに submitForm メソッドを呼び出します。
    -->
    <form @submit.prevent="submitForm" class="modal-space">
      <!-- =================================================================== -->
      <!-- 1. 基本情報                                                       -->
      <!-- =================================================================== -->
      <div>
        <label for="user-account-name-add" class="form-label">
          アカウント名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-account-name-add"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <!-- バリデーションエラーメッセージを表示 -->
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="user-email-add" class="form-label">
          メールアドレス <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-email-add"
          type="email"
          v-model="email"
          v-bind="emailAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.email }"
        />
        <p v-if="errors.email" class="text-error mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label for="user-password-add" class="form-label">
          パスワード <span class="required-asterisk">*</span>
        </label>
        <input
          id="user-password-add"
          type="password"
          v-model="password"
          v-bind="passwordAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.password }"
        />
        <p v-if="errors.password" class="text-error mt-1">
          {{ errors.password }}
        </p>
      </div>

      <!-- =================================================================== -->
      <!-- 2. リソース制限                                                   -->
      <!-- =================================================================== -->
      <FormSection title="リソース制限">
        <div class="space-y-2">
          <!-- CPUコア数 -->
          <FormInput
            name="user-max-cpu"
            label="CPUコア数"
            type="number"
            placeholder="無制限"
            v-model.number="maxCpuCores"
            v-model:attrs="maxCpuCoresAttrs"
            :error="errors.maxCpuCores"
          >
            <template #suffix>
              <span class="form-unit-label">vCPU</span>
            </template>
          </FormInput>

          <!-- メモリサイズ (MB) -->
          <FormInput
            name="user-max-memory"
            label="メモリ (MB)"
            type="number"
            placeholder="無制限"
            v-model.number="maxMemorySizeInMb"
            v-model:attrs="maxMemorySizeInMbAttrs"
            :error="errors.maxMemorySizeInMb"
          >
            <template #suffix>
              <span class="form-unit-label">MB</span>
            </template>
          </FormInput>

          <!-- ストレージサイズ (GB) -->
          <FormInput
            name="user-max-storage"
            label="ストレージ (GB)"
            type="number"
            placeholder="無制限"
            v-model.number="maxStorageSizeInGb"
            v-model:attrs="maxStorageSizeInGbAttrs"
            :error="errors.maxStorageSizeInGb"
          >
            <template #suffix>
              <span class="form-unit-label">GB</span>
            </template>
          </FormInput>
        </div>
      </FormSection>

      <!-- =================================================================== -->
      <!-- 3. フッター (追加ボタン)                                          -->
      <!-- =================================================================== -->
      <div class="modal-footer">
        <!-- isCreating が true の間 (API通信中) はボタンを無効化 -->
        <button typeS="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "追加中..." : "追加" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 利用者追加モーダル (MoUserAdd.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理やAPI送信ロジックは `useUserAddForm` Composable に
 * 分離されています。
 * =================================================================================
 */
// Composable をインポート
import { useUserAddForm } from "~/composables/modal/useUserAddForm";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors, // エラーオブジェクト
  // フォームフィールド
  name,
  nameAttrs,
  email,
  emailAttrs,
  password,
  passwordAttrs,
  maxCpuCores,
  maxCpuCoresAttrs,
  maxMemorySizeInMb,
  maxMemorySizeInMbAttrs,
  maxStorageSizeInGb,
  maxStorageSizeInGbAttrs,
  // 状態とアクション
  isCreating,
  onFormSubmit, // Composable が提供する送信ハンドラ
} = useUserAddForm();

// --- イベントハンドラ ---
// Composable から受け取った `onFormSubmit` 関数に、
// このコンポーネントの `emit` 関数を渡して実行するラッパー関数。
const submitForm = onFormSubmit(emit);
</script>
