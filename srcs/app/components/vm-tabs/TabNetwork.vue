<template>
  <div>
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
      :error-message="errors.subnetId"
      :placeholder-value="undefined"
      v-model="subnetId"
    >
      <template #option="{ option }">
        {{ option.name }} <span class="text-gray-500">({{ option.cidr }})</span>
      </template>
    </FormSelect>

    <div>
      <label class="form-label-sm">セキュリティグループ</label>
      <div class="flex items-center gap-3">
        <div class="flex-grow">
          <FormSelect
            :label="undefined"
            name="sg-add-select"
            :options="availableGroups ?? []"
            placeholder="グループを選択して追加..."
            :pending="sgPending"
            :error="sgError"
            :placeholder-value="null"
            v-model="selectedGroupToAdd"
          />
        </div>
        <button
          type="button"
          @click="addSecurityGroup"
          :disabled="!selectedGroupToAdd"
          class="btn-secondary"
        >
          追加
        </button>
      </div>
      <p v-if="errors.securityGroupIds" class="text-error h-5">
        {{ errors.securityGroupIds }}
      </p>

      <table class="w-full text-sm text-left text-gray-700 mt-4">
        <thead class="text-xs text-gray-800 uppercase bg-gray-100">
          <tr>
            <th class="px-4 py-2">適用するグループ名</th>
            <th class="px-4 py-2 text-center w-20">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sgFields.length === 0">
            <td colspan="2" class="text-center py-4 text-gray-500">
              セキュリティグループが選択されていません
            </td>
          </tr>
          <tr
            v-for="(field, index) in sgFields"
            :key="field.key"
            class="bg-white border-b"
          >
            <td class="px-4 py-2 font-medium">
              {{ getGroupName(field.value) }}
            </td>
            <td class="px-4 py-2 text-center">
              <button
                type="button"
                @click="removeSg(index)"
                class="btn-icon-danger"
                title="解除"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <FormDropZone
      label="キーペア (公開鍵)"
      v-model="keyPairFile"
      accept=".pub"
    />
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
import { useForm, useFieldArray } from "vee-validate";
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
    vpcId: z.string({ required_error: "VPCを選択してください。" }),
    subnetId: z.string({ required_error: "サブネットを選択してください。" }),
    securityGroupIds: z.string().nullable(),
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
    securityGroupIds: null,
    keyPairFile: null,
  },
});

// 各フォームフィールドとVeeValidateを連携
const [vpcId, vpcIdAttrs] = defineField("vpcId");
const [subnetId, subnetIdAttrs] = defineField("subnetId");
const [securityGroupIds, securityGroupIdsAttrs] =
  defineField("securityGroupIds");
const [keyPairFile] = defineField("keyPairFile");

// 親コンポーネント（ウィザードの統括役）に、このタブのデータとバリデーション状態を公開
const {
  fields: sgFields, // v-for で使用
  push: pushSg, // ★ ここで pushSg が定義されます
  remove: removeSg, // 削除ボタンで使用
} = useFieldArray<string>("securityGroupIdss"); // "securityGroupIdss" という名前の配列を管理

// --- 親コンポーネントへの公開 ---
defineExpose({
  formData: values,
  isValid: meta,
});

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
} = useResourceList<VirtualNetworkDTO>("virtual-networks");

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

// --- ★ セキュリティグループ (Add/Remove) ロジック ---
const selectedGroupToAdd = ref<string | null>(null);

// 適用済みのグループを除外した、追加可能なグループのリスト
const availableGroups = computed(() => {
  const appliedIds = new Set(values.securityGroupIds || []);
  return securityGroups.value?.filter((sg) => !appliedIds.has(sg.id)) || [];
});

// IDからグループ名を取得するヘルパー関数
const getGroupName = (id: string) => {
  return securityGroups.value?.find((sg) => sg.id === id)?.name || id;
};

// 「追加」ボタンの処理
const addSecurityGroup = () => {
  if (selectedGroupToAdd.value) {
    pushSg(selectedGroupToAdd.value); // ★ useFieldArray から取得した関数
    selectedGroupToAdd.value = null;
  }
};
</script>

<style scoped>
/* (もし FormSection を使わない場合は modal-space を有効化) */
/*
.modal-space {
  @apply space-y-4;
}
*/

/* (もし btn-icon-danger がグローバルCSSになければ定義) */
.btn-icon-danger {
  @apply p-1.5 text-gray-400 rounded-md transition-colors;
  @apply hover:text-red-600 hover:bg-red-100;
  @apply focus:outline-none focus:ring-2 focus:ring-red-400;
}
</style>
