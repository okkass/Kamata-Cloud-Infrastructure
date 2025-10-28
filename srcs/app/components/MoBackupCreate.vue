<template>
  <BaseModal :show="show" title="バックアップ作成" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="backup-name-create" class="form-label">
          バックアップ名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="backup-name-create"
          type="text"
          placeholder="例: backup-vm-kamata01-os-20251023"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="backup-target-vm" class="form-label">
          バックアップ対象の仮想マシン <span class="required-asterisk">*</span>
        </label>
        <FormSelect
          id="backup-target-vm"
          name="backup-target-vm-select"
          v-model="targetVmId"
          :options="virtualMachines ?? []"
          option-value="id"
          option-label="name"
          placeholder="仮想マシンを選択してください"
          :pending="vmsPending"
          :error="vmsError"
          :error-message="errors.targetVmId"
          :required="true"
          :placeholder-value="undefined"
        />
      </div>

      <div>
        <label for="backup-target-storage" class="form-label">
          バックアップ対象のストレージ <span class="required-asterisk">*</span>
        </label>
        <FormSelect
          id="backup-target-storage"
          name="backup-target-storage-select"
          v-model="targetStorageId"
          :options="availableStorages ?? []"
          option-value="id"
          option-label="name"
          placeholder="ストレージを選択してください"
          :pending="storagesPending"
          :error="storagesError"
          :error-message="errors.targetStorageId"
          :required="true"
          :placeholder-value="undefined"
          :disabled="
            !targetVmId ||
            vmsPending ||
            !!vmsError ||
            availableStorages?.length === 0
          "
        />
        <p
          v-if="
            targetVmId &&
            !storagesPending &&
            !storagesError &&
            availableStorages?.length === 0
          "
          class="text-sm text-gray-500 mt-1"
        >
          選択した仮想マシンにはバックアップ可能なストレージがありません。
        </p>
      </div>

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * バックアップ作成モーダル (MoBackupCreate.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理、API連携、依存関係のあるプルダウンの制御ロジックは
 * `useBackupCreateForm` Composable に分離されています。
 * =================================================================================
 */
// Composable をインポート
import { useBackupCreateForm } from "~/composables/modal/useBackupCreateForm";
// 必要な共通コンポーネントをインポート
import FormSelect from "~/components/FormSelect.vue";

// --- 親コンポーネントとの連携 (Props & Emits) ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors, // バリデーションエラー
  // フォームフィールド
  name,
  nameAttrs,
  targetVmId, // ★ 仮想マシンID (v-model)
  targetStorageId, // ★ ストレージID (v-model)
  // プルダウンデータと状態
  virtualMachines, // ★ VMリスト
  vmsPending, // ★ VMリスト読込中
  vmsError, // ★ VMリストエラー
  availableStorages, // ★ ストレージリスト
  storagesPending, // ★ ストレージリスト読込中
  storagesError, // ★ ストレージリストエラー
  // 状態とアクション
  isCreating,
  onFormSubmit,
} = useBackupCreateForm();

// --- イベントハンドラ ---
const submitForm = onFormSubmit(emit);
</script>
