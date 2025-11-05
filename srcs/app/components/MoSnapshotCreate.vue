<template>
  <BaseModal :show="show" title="スナップショット作成" @close="$emit('close')">
    <form @submit.prevent="submitForm" class="modal-space">
      <div>
        <label for="snapshot-name-create" class="form-label">
          スナップショット名 <span class="required-asterisk">*</span>
        </label>
        <input
          id="snapshot-name-create"
          type="text"
          placeholder="例: snapshot-webserver-before-update"
          v-model="name"
          v-bind="nameAttrs"
          class="form-input"
          :class="{ 'form-border-error': errors.name }"
        />
        <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label for="snapshot-target-vm" class="form-label">
          対象仮想マシン <span class="required-asterisk">*</span>
        </label>
        <FormSelect
          id="snapshot-target-vm"
          name="snapshot-target-vm-select"
          v-model="targetVmId"
          :options="virtualMachines ?? []"
          option-value="id"
          option-label="name"
          placeholder="仮想マシンを選択"
          :pending="vmsPending"
          :error="vmsError"
          :error-message="errors.targetVmId"
          :required="true"
          :placeholder-value="undefined"
        />
      </div>
    </form>
    <template #footer>
      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * スナップショット作成モーダル (MoSnapshotCreate.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * 実際のフォームの状態管理、API連携ロジックは `useSnapshotCreateForm` Composable に
 * 分離されています。
 * =================================================================================
 */
// Composable をインポート (後で作成)
import { useSnapshotCreateForm } from "~/composables/modal/useSnapshotCreateForm";
// 必要な共通コンポーネントをインポート (パスを確認・調整してください)
import FormSelect from "~/components/FormSelect.vue"; // 仮パス

// --- 親コンポーネントとの連携 (Props & Emits) ---
// show prop: モーダルの表示状態を制御します (trueで表示)
defineProps({ show: { type: Boolean, required: true } });
// close イベント: モーダルを閉じるよう親に通知します
// success イベント: スナップショット作成成功を親に通知します (一覧更新などに使用)
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
const {
  errors, // バリデーションエラーオブジェクト ({ name?: string, targetVmId?: string })
  // フォームフィールド
  name, // スナップショット名の v-model 用 (ref<string>)
  nameAttrs, // スナップショット名の v-bind 用
  targetVmId, // 対象VMの v-model 用 (ref<string | undefined>)
  // プルダウン用データと状態
  virtualMachines, // VMリスト (ref<VirtualMachineDTO[] | null>)
  vmsPending, // VMリスト読み込み中か (ref<boolean>)
  vmsError, // VMリスト読み込みエラー (ref<Error | null>)
  // 状態とアクション
  isCreating, // API通信中か (ref<boolean>)
  onFormSubmit, // Composable が提供する送信ハンドラ
} = useSnapshotCreateForm();

// --- イベントハンドラ ---
// Composable から受け取った `onFormSubmit` 関数に、
// このコンポーネントの `emit` 関数を渡して実行するラッパー関数。
const submitForm = onFormSubmit(emit);
</script>
