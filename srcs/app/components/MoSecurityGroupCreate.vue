<template>
  <BaseModal :show="show" title="セキュリティグループ作成" @close="handleClose">
    <form
      id="security-group-create-form"
      @submit.prevent="onSubmit"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
          placeholder="例: web-server-sg"
        />

        <FormTextarea
          label="説明"
          name="sg-description"
          :rows="3"
          v-model="description"
          v-bind="descriptionAttrs"
          :error="errors.description"
          placeholder="例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
        />
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
        <UiSubmitButton
          :disabled="isCreating || !isValid"
          :loading="isCreating"
          label="セキュリティグループを作成"
          form="security-group-create-form"
          type="submit"
        />
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
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";
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
  isValid,
  onFormSubmit,
  makehandleClose,
} = useSecurityGroupForm();
const onSubmit = onFormSubmit(emit);
const handleClose = makehandleClose(emit);
</script>
