<template>
  <div class="modal-space">
    <FormSelect
      label="ネットワーク"
      name="network-select"
      :pending="networksPending"
      :error="networksError"
      :options="networks ?? []"
      placeholder="ネットワークを選択してください"
      :error-message="errors.networkId"
      :required="true"
      :placeholder-value="undefined"
      v-model="networkId"
      v-model:attrs="networkIdAttrs"
    />

    <FormSelect
      label="セキュリティグループ"
      name="security-group-select"
      :pending="sgPending"
      :error="sgError"
      :options="securityGroups ?? []"
      placeholder="なし"
      :error-message="errors.securityGroupId"
      :placeholder-value="null"
      v-model="securityGroupId"
      v-model:attrs="securityGroupIdAttrs"
    />

    <FormDropZone v-model="keyPairFile" />
  </div>
</template>

<script setup lang="ts">
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// バリデーションスキーマ (変更なし)
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    networkId: z.string({ required_error: "ネットワークを選択してください。" }),
    securityGroupId: z.string().nullable(),
    keyPairFile: z.any().nullable(),
  })
);

// ==============================================================================
// フォーム設定 (変更なし)
// ==============================================================================
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    networkId: undefined,
    securityGroupId: null,
    keyPairFile: null,
  },
});
const [networkId, networkIdAttrs] = defineField("networkId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
const [keyPairFile] = defineField("keyPairFile");
defineExpose({ formData: values, isValid: meta });

// ==============================================================================
// API連携 (変更なし)
// ==============================================================================
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetwork>("virtual-network");
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-group");
</script>