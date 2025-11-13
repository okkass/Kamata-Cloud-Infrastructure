<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ編集"
    @close="$emit('close')"
    size="lg"
  >
    <form @submit.prevent="submitForm">
      <FormSection title="基本情報">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name-edit"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
        />
        <FormTextarea
          label="説明"
          name="sg-description-edit"
          :rows="3"
          v-model="description"
          v-bind="descriptionAttrs"
          :error="errors.description"
        />
      </FormSection>

      <RuleTable
        title="インバウンドルール"
        :rules="inboundFields"
        :errors="errors"
        field-name-prefix="inboundRules"
        :protocol-options="protocolOptions"
        :action-options="actionOptions"
        @add-rule="addInboundRule"
        @delete-rule="removeInbound"
      />

      <RuleTable
        title="アウトバウンドルール"
        :rules="outboundFields"
        :errors="errors"
        field-name-prefix="outboundRules"
        :protocol-options="protocolOptions"
        :action-options="actionOptions"
        @add-rule="addOutboundRule"
        @delete-rule="removeOutbound"
      />
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
 * セキュリティグループ編集モーダル (MoSecurityGroupEdit.vue)
 * ---------------------------------------------------------------------------------
 * UIの表示に特化したコンポーネントです。
 * ★ RuleTable.vue サブコンポーネントを使用してルールを描画します。
 * =================================================================================
 */
import { useSecurityGroupEditForm } from "~/composables/modal/useSecurityGroupEditForm";
// ★ 型定義をインポート (パスは仮定)
import type { SecurityGroupDTO } from "~~/shared/types/security-groups";

// ★ 汎用コンポーネントをインポート
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue"; // (このコンポーネントが存在する前提)
import FormSection from "~/components/Form/Section.vue";
import FormSelect from "~/components/Form/Select.vue";
// ★ RuleTable サブコンポーネントをインポート
import RuleTable from "~/components/RuleTable.vue";

// --- 親コンポーネントとの連携 (Props & Emits) ---
const props = defineProps({
  /** モーダルの表示状態 (trueで表示) */
  show: { type: Boolean, required: true },
  /** 編集対象の初期データ。呼び出し元(一覧ページなど)から渡される */
  securityGroupData: {
    type: Object as PropType<SecurityGroupDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable からフォームロジックと状態を取得 ---
// (useSecurityGroupEditForm.ts は前回作成したものでOK)
const {
  errors,
  values, // RuleTable がエラー参照で使う
  // フォームフィールド
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  // 動的配列
  inboundFields,
  outboundFields,
  removeInbound,
  removeOutbound,
  addInboundRule,
  addOutboundRule,
  // 状態とアクション
  isUpdating,
  onFormSubmit,
  // FormSelect用
  protocolOptions,
  actionOptions,
} = useSecurityGroupEditForm(props); // Composableにpropsを渡す

// --- イベントハンドラ ---
/** フォームの送信イベントを Composable に渡す */
const submitForm = onFormSubmit(emit);
</script>
