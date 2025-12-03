<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ作成"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitForm" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label for="sg-name" class="form-label">
            セキュリティグループ名 <span class="required-asterisk">*</span>
          </label>
          <input
            id="sg-name"
            type="text"
            v-model="name"
            v-bind="nameAttrs"
            class="form-input"
            :class="{ 'form-border-error': errors.name }"
            placeholder="例: web-server-sg"
          />
          <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <label for="sg-description" class="form-label">説明</label>
          <textarea
            id="sg-description"
            :rows="3"
            v-model="description"
            v-bind="descriptionAttrs"
            class="form-input"
            :class="{ 'form-border-error': errors.description }"
            placeholder="例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
          ></textarea>
          <p v-if="errors.description" class="text-error mt-1">
            {{ errors.description }}
          </p>
        </div>
      </div>

      <RuleTable
        title="インバウンドルール"
        :rules="inboundRules"
        :errors="errors"
        field-name-prefix="inboundRules"
        @add-rule="addInboundRule"
        @delete-rule="removeInboundRule"
      />

      <RuleTable
        title="アウトバウンドルール"
        :rules="outboundRules"
        :errors="errors"
        field-name-prefix="outboundRules"
        @add-rule="addOutboundRule"
        @delete-rule="removeOutboundRule"
      />
    </form>

    <template #footer>
      <div class="modal-footer">
        <button
          type="button"
          @click="submitForm"
          class="btn btn-primary"
          :disabled="isCreating"
        >
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * セキュリティグループ作成モーダル (MoSecurityGroupCreate.vue)
 * =================================================================================
 */
import { useSecurityGroupForm } from "~/composables/modal/useSecurityGroupCreateForm";
import RuleTable from "~/components/RuleTable.vue";

defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  inboundRules,
  outboundRules,
  // 操作関数
  addInboundRule,
  removeInboundRule,
  addOutboundRule,
  removeOutboundRule,
  isCreating,
  onFormSubmit,
} = useSecurityGroupForm();

const submitHandler = onFormSubmit(emit);
const submitForm = () => {
  submitHandler();
};
</script>
