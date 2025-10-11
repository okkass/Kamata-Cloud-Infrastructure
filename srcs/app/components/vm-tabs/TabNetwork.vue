<template>
  <div class="modal-space">
    <FormSelect
      label="仮想ネットワーク (VPC)"
      name="vpcId"
      :options="networks ?? []"
      placeholder="VPCを選択してください"
      :required="true"
      :pending="networksPending"
      :error="networksError"
      :error-message="errors.vpcId"
      :placeholder-value="undefined"
      v-model="vpcId"
      v-model:attrs="vpcIdAttrs"
    />

    <FormSelect
      label="サブネット"
      name="subnetId"
      :options="availableSubnets"
      placeholder="サブネットを選択してください"
      :required="true"
      :pending="networksPending"
      :disabled="!vpcId"
      :error-message="errors.subnetId"
      :error="networksError"
      :placeholder-value="undefined"
      v-model="subnetId"
      v-model:attrs="subnetIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }} ({{ option.cidr }})
      </template>
    </FormSelect>

    <FormSelect
      label="セキュリティグループ"
      name="securityGroupId"
      :options="securityGroups ?? []"
      placeholder="なし"
      :pending="sgPending"
      :error="sgError"
      :placeholder-value="null"
      v-model="securityGroupId"
      v-model:attrs="securityGroupIdAttrs"
    />

    <FormDropZone v-model="keyPairFile" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ★ 1. ZodスキーマにvpcIdを追加
const validationSchema = toTypedSchema(
  z.object({
    vpcId: z.string({ required_error: "VPCを選択してください。" }),
    subnetId: z.string({ required_error: "サブネットを選択してください。" }),
    securityGroupId: z.string().nullable(),
    keyPairFile: z.any().nullable(),
  })
);

// ★ 2. useFormの管理下にvpcIdを追加
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    vpcId: undefined,
    subnetId: undefined,
    securityGroupId: null,
    keyPairFile: null,
  },
});

const [vpcId, vpcIdAttrs] = defineField("vpcId");
const [subnetId, subnetIdAttrs] = defineField("subnetId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
const [keyPairFile] = defineField("keyPairFile");

defineExpose({ formData: values, isValid: meta });

// --- (API連携は変更なし) ---
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetwork>("virtual-networks");
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-groups");

// ★ 3. computedとwatchをvee-validate管理下の変数(vpcId)を使うように修正
const availableSubnets = computed(() => {
  if (!vpcId.value || !networks.value) return [];
  const selectedVPC = networks.value.find((net) => net.id === vpcId.value);
  return selectedVPC?.subnets || [];
});

watch(vpcId, () => {
  setFieldValue("subnetId", undefined);
});

</script>
