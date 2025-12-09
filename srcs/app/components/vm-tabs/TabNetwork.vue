<template>
  <div class="modal-space space-y-4">
    <FormSelect
      label="仮想ネットワーク (VPC)"
      name="vpcId"
      :options="networks ?? []"
      option-label="name"
      option-value="id"
      placeholder="VPCを選択してください"
      :required="true"
      :pending="networksPending"
      :error="networksError"
      :error-message="errors.vpcId"
      v-model="vpcId"
      v-bind="vpcIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }}
        <span v-if="option.cidr" class="text-gray-500"
          >({{ option.cidr }})</span
        >
      </template>
    </FormSelect>

    <FormSelect
      label="サブネット"
      name="subnetId"
      :options="availableSubnets"
      option-label="name"
      option-value="id"
      placeholder="サブネットを選択してください"
      :required="true"
      :pending="networksPending"
      :disabled="!vpcId"
      :error="networksError"
      :error-message="errors.subnetId"
      v-model="subnetId"
      v-bind="subnetIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }} <span class="text-gray-500">({{ option.cidr }})</span>
      </template>
    </FormSelect>

    <FormSelect
      label="セキュリティグループ"
      name="securityGroupId"
      :options="securityGroups ?? []"
      option-label="name"
      option-value="id"
      placeholder="なし"
      :pending="sgPending"
      :error="sgError"
      :error-message="errors.securityGroupId"
      v-model="securityGroupId"
      v-bind="securityGroupIdAttrs"
    />

    <DropZone
      label="公開鍵 (任意)"
      name="keyPairFile"
      accept=".pub"
      :error="errors.keyPairFile"
      v-model="keyPairFile"
      v-bind="keyPairFileAttrs"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ネットワーク/セキュリティ タブ (TabNetwork.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードのネットワーク設定を行うタブ。
 * VPC、サブネット、セキュリティグループ、SSH公開鍵の設定を行います。
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// 共通コンポーネント
import FormSelect from "~/components/Form/Select.vue";
// ★ InputFile を DropZone に変更
import DropZone from "~/components/Form/DropZone.vue";

// 型定義 (自動インポート)
// type VirtualNetworkResponse
// type SecurityGroupResponse

/**
 * ==============================================================================
 * Validation Schema
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    vpcId: z
      .string({ message: "VPCを選択してください。" })
      .min(1, "VPCを選択してください。"),
    subnetId: z
      .string({ message: "サブネットを選択してください。" })
      .min(1, "サブネットを選択してください。"),
    securityGroupId: z.string().nullable().optional(),
    // ファイルオブジェクト(File) または undefined
    keyPairFile: z.any().optional(),
  })
);

/**
 * ==============================================================================
 * Form State Management
 * ==============================================================================
 */
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    vpcId: undefined,
    subnetId: undefined,
    securityGroupId: null,
    keyPairFile: undefined,
  },
});

const [vpcId, vpcIdAttrs] = defineField("vpcId");
const [subnetId, subnetIdAttrs] = defineField("subnetId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
const [keyPairFile, keyPairFileAttrs] = defineField("keyPairFile");

/**
 * ==============================================================================
 * API Data Fetching
 * ==============================================================================
 */
// 1. 仮想ネットワーク (VPC)
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetworkResponse>("virtual-networks");

// 2. セキュリティグループ
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupResponse>("security-groups");

/**
 * ==============================================================================
 * UI Logic
 * ==============================================================================
 */

// 選択されたVPCに紐づくサブネットリストを計算
const availableSubnets = computed(() => {
  if (!vpcId.value || !networks.value) return [];
  const selectedVPC = networks.value.find((net) => net.id === vpcId.value);
  return selectedVPC?.subnets || [];
});

// VPCが変更されたら、選択中のサブネットをリセットする
watch(vpcId, () => {
  setFieldValue("subnetId", undefined);
});

/**
 * ==============================================================================
 * Expose
 * ==============================================================================
 */
defineExpose({
  formData: values,
  isValid: meta,
});
</script>

<style scoped>
.modal-space {
  @apply p-1;
}
</style>
