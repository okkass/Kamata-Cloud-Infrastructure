<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ編集"
    @close="$emit('close')"
    size="lg"
  >
    <!-- データロード待機 -->
    <div v-if="!editedData" class="text-center py-8 text-gray-500">
      読み込み中...
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-6">
      <!-- 1. 基本情報 -->
      <FormSection title="基本情報">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name-edit"
          v-model="editedData.name"
          :error="errors.name"
          :required="true"
        />
        <FormTextarea
          label="説明"
          name="sg-description-edit"
          :rows="3"
          v-model="editedData.description"
          :error="errors.description"
        />
      </FormSection>

      <!-- 2. インバウンドルール -->
      <FormSection title="インバウンドルール">
        <div
          v-if="inboundRules.length === 0"
          class="text-center text-gray-500 py-4"
        >
          ルールがありません。
        </div>
        <div v-for="rule in inboundRules" :key="rule.id" class="rule-grid">
          <FormInput
            :name="`in-name-${rule.id}`"
            label="ルール名"
            v-model="rule.name"
            :error="getError(rule, 'name')"
          />
          <FormSelect
            :name="`in-protocol-${rule.id}`"
            label="プロトコル"
            v-model="rule.protocol"
            :options="protocolOptions"
          />
          <FormInput
            :name="`in-port-${rule.id}`"
            label="ポート"
            type="number"
            v-model.number="rule.port"
            placeholder="ANY"
          />
          <FormInput
            :name="`in-target-${rule.id}`"
            label="送信元 (IP)"
            v-model="rule.targetIp"
            :error="getError(rule, 'targetIp')"
          />
          <FormSelect
            :name="`in-action-${rule.id}`"
            label="アクション"
            v-model="rule.action"
            :options="actionOptions"
          />
          <div class="flex items-end pb-1">
            <button
              type="button"
              @click="removeRule(getOriginalIndex(rule))"
              class="btn-icon-danger"
              title="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.977 0c-.043.051-.084.102-.125.153m12.702 0c.043.051.084.102.125.153m-12.452 0c-.342.052-.682.107-1.022.166"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <button type="button" @click="addInboundRule" class="btn-secondary">
            + インバウンドルールを追加
          </button>
        </div>
      </FormSection>

      <!-- 3. アウトバウンドルール -->
      <FormSection title="アウトバウンドルール">
        <div
          v-if="outboundRules.length === 0"
          class="text-center text-gray-500 py-4"
        >
          ルールがありません。
        </div>
        <div v-for="rule in outboundRules" :key="rule.id" class="rule-grid">
          <FormInput
            :name="`out-name-${rule.id}`"
            label="ルール名"
            v-model="rule.name"
            :error="getError(rule, 'name')"
          />
          <FormSelect
            :name="`out-protocol-${rule.id}`"
            label="プロトコル"
            v-model="rule.protocol"
            :options="protocolOptions"
          />
          <FormInput
            :name="`out-port-${rule.id}`"
            label="ポート"
            type="number"
            v-model.number="rule.port"
            placeholder="ANY"
          />
          <FormInput
            :name="`out-target-${rule.id}`"
            label="宛先 (IP)"
            v-model="rule.targetIp"
            :error="getError(rule, 'targetIp')"
          />
          <FormSelect
            :name="`out-action-${rule.id}`"
            label="アクション"
            v-model="rule.action"
            :options="actionOptions"
          />
          <div class="flex items-end pb-1">
            <button
              type="button"
              @click="removeRule(getOriginalIndex(rule))"
              class="btn-icon-danger"
              title="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.977 0c-.043.051-.084.102-.125.153m12.702 0c.043.051.084.102.125.153m-12.452 0c-.342.052-.682.107-1.022.166"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <button type="button" @click="addOutboundRule" class="btn-secondary">
            + アウトバウンドルールを追加
          </button>
        </div>
      </FormSection>
    </form>

    <!-- フッター -->
    <template #footer>
      <div class="modal-footer">
        <!-- 変更がない場合 (isDirty=false) はボタンを無効化 -->
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isSaving || !isDirty"
        >
          {{ isSaving ? "保存中..." : "保存" }}
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
 * useResourceUpdater を利用した差分更新版
 * =================================================================================
 */
import { useSecurityGroupEditForm } from "~/composables/modal/useSecurityGroupEditForm";
import type { SecurityGroupDTO } from "~~/shared/types/dto/security-group/SecurityGroupDTO";

import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";
import FormSection from "~/components/Form/Section.vue";
import FormSelect from "~/components/Form/Select.vue";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  securityGroupData: {
    type: Object as PropType<SecurityGroupDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

// --- Composable ---
const {
  editedData,
  errors,
  isDirty,
  isSaving,
  onFormSubmit,
  inboundRules,
  outboundRules,
  addInboundRule,
  addOutboundRule,
  removeRule,
  getOriginalIndex,
  protocolOptions,
  actionOptions,
} = useSecurityGroupEditForm(props);

const submitForm = onFormSubmit(emit);

// バリデーションエラー取得ヘルパー
// (配列のindexが変わる可能性があるため、ruleオブジェクトから探す簡易的な実装)
const getError = (rule: any, field: string) => {
  // 今回は簡易実装のため errors オブジェクトから直接取得する形にはしていません。
  // useSecurityGroupEditForm 内の validate() でセットされるキーと一致させる必要があります。
  // ここでは仮に、全体の errors オブジェクトに `rules[INDEX].field` 形式で入っていると想定し、
  // getOriginalIndex でインデックスを特定して取得します。
  const index = getOriginalIndex(rule);
  return errors.value[`rules[${index}].${field}`];
};
</script>

<style scoped>
.rule-grid {
  display: grid;
  /* Name, Protocol, Port, Target, Action, Delete */
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr 0.5fr;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.rule-grid:last-of-type {
  border-bottom: none;
}
.btn-icon-danger {
  @apply p-1.5 text-gray-400 rounded-md transition-colors;
  @apply hover:text-red-600 hover:bg-red-100;
  @apply focus:outline-none focus:ring-2 focus:ring-red-400;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 whitespace-nowrap;
}
</style>
