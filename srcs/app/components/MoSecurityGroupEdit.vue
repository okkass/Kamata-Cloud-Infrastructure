<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ編集"
    @close="$emit('close')"
    size="lg"
  >
    <div v-if="!editedData" class="text-center py-8 text-gray-500">
      読み込み中...
    </div>

    <div v-else>
      <form @submit.prevent="submitForm" class="space-y-6">
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

        <RuleTable
          title="インバウンドルール"
          :rules="inboundRules"
          :errors="errors"
          field-name-prefix="inboundRules"
          @add-rule="addInboundRule"
          @delete-rule="removeRule"
        />

        <RuleTable
          title="アウトバウンドルール"
          :rules="outboundRules"
          :errors="errors"
          field-name-prefix="outboundRules"
          @add-rule="addOutboundRule"
          @delete-rule="removeRule"
        />
      </form>
    </div>

    <template #footer>
      <div class="modal-footer">
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
 * =================================================================================
 */
import { useSecurityGroupEditForm } from "~/composables/modal/useSecurityGroupEditForm";

import FormInput from "~/components/Form/Input.vue";
import FormTextarea from "~/components/Form/Textarea.vue"; // パス修正の可能性あり
import FormSection from "~/components/Form/Section.vue";
import RuleTable from "~/components/RuleTable.vue";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  securityGroupData: {
    type: Object as PropType<SecurityGroupResponse | null>,
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
} = useSecurityGroupEditForm(props);

const submitForm = onFormSubmit(emit);
</script>
