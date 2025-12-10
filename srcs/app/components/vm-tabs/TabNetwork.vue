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
    >
      <template #option="{ option }">
        {{ option.name }}
        <span v-if="option.cidr" class="text-gray-500">
          ({{ option.cidr }})</span
        >
      </template>
    </FormSelect>

    <FormSelect
      label="サブネット"
      name="subnetId"
      :options="availableSubnets"
      placeholder="サブネットを選択してください"
      :required="true"
      :pending="networksPending"
      :disabled="!vpcId"
      :error="networksError"
      :error-message="errors.subnetId"
      :placeholder-value="undefined"
      v-model="subnetId"
      v-model:attrs="subnetIdAttrs"
    >
      <template #option="{ option }">
        {{ option.name }} <span class="text-gray-500">({{ option.cidr }})</span>
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

    <FormDropZone label="キーペア (公開鍵)" v-model="keyPairFile" accept=".pub" />
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ネットワーク/セキュリティ タブ (TabNetwork.vue)
 * ---------------------------------------------------------------------------------
 * 仮想マシン作成ウィザードのネットワーク関連の設定を担当するタブ。
 * - VPCとサブネットの依存関係を持つプルダウン
 * - セキュリティグループの選択
 * - SSH公開鍵のアップロード
 * といった機能を提供します。
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

/**
 * ==============================================================================
 * Validation Schema (バリデーションスキーマ)
 * ------------------------------------------------------------------------------
 * このタブ内のフォームフィールドに対する入力ルールをZodで定義します。
 * ==============================================================================
 */
const validationSchema = toTypedSchema(
  z.object({
    vpcId: z.string({ message: "VPCを選択してください。" }),
    subnetId: z.string({ message: "サブネットを選択してください。" }),
    securityGroupId: z.string().nullable(),
    keyPairFile: z.any().nullable(),
  })
);

/**
 * ==============================================================================
 * Form State Management (フォーム状態管理)
 * ------------------------------------------------------------------------------
 * VeeValidateのuseFormを使い、このタブのフォーム状態を管理します。
 * ==============================================================================
 */
const { errors, defineField, values, meta, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    vpcId: undefined,
    subnetId: undefined,
    securityGroupId: null,
    keyPairFile: null,
  },
});

// 各フォームフィールドとVeeValidateを連携
const [vpcId, vpcIdAttrs] = defineField("vpcId");
const [subnetId, subnetIdAttrs] = defineField("subnetId");
const [securityGroupId, securityGroupIdAttrs] = defineField("securityGroupId");
const [keyPairFile] = defineField("keyPairFile");

// 親コンポーネント（ウィザードの統括役）に、このタブのデータとバリデーション状態を公開
defineExpose({ formData: values, isValid: meta });

/**
 * ==============================================================================
 * API Data Fetching (APIデータ取得)
 * ------------------------------------------------------------------------------
 * 各プルダウンの選択肢となるデータをAPIから取得します。
 * ==============================================================================
 */
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

/**
 * ==============================================================================
 * UI Logic (UIロジック)
 * ------------------------------------------------------------------------------
 * ユーザー操作に応じたインタラクティブな挙動を定義します。
 * ==============================================================================
 */

/**
 * 選択されたVPCに属するサブネットのリストを動的に計算します。
 * @returns {Array} 選択可能なサブネットの配列
 */
const availableSubnets = computed(() => {
  if (!vpcId.value || !networks.value) return [];
  const selectedVPC = networks.value.find((net) => net.id === vpcId.value);
  return selectedVPC?.subnets || [];
});

/**
 * VPCの選択が変更されたことを監視し、サブネットの選択をリセットします。
 * これにより、ユーザーがVPCを変更した際に、古いサブネットが選択されたままになるのを防ぎます。
 */
watch(vpcId, () => {
  setFieldValue("subnetId", undefined);
});
</script>
