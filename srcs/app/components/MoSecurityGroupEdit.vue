<template>
  <BaseModal :show="show" title="セキュリティグループ編集" @close="handleClose">
    <form
      id="security-group-edit-form"
      @submit.prevent="onSubmit"
      class="space-y-6"
    >
      <div class="space-y-4">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name-edit"
          type="text"
          v-model="name"
          v-bind="nameAttrs"
          :error="errors.name"
          :required="true"
          placeholder="例: web-server-sg"
        />

        <FormTextarea
          label="説明"
          name="sg-description-edit"
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
          :disabled="isSaving || !isValid"
          :loading="isSaving"
          label="セキュリティグループを更新"
          form="security-group-edit-form"
          type="submit"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * セキュリティグループ編集モーダル (MoSecurityGroupEdit.vue)
 * =================================================================================
 */
import { useSecurityGroupEditForm } from "~/composables/modal/useSecurityGroupEditForm";
import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue";
import RuleTable from "~/components/RuleTable.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  data: {
    type: Object as PropType<SecurityGroupResponse | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "success"]);

const {
  errors,
  name,
  nameAttrs,
  description,
  descriptionAttrs,
  inboundRules,
  outboundRules,
  addInboundRule,
  removeInboundRule,
  addOutboundRule,
  removeOutboundRule,
  isSaving,
  isValid,
  onFormSubmit,
  makehandleClose,
} = useSecurityGroupEditForm(props);

const onSubmit = onFormSubmit(emit);
const handleClose = makehandleClose(emit);
</script>
