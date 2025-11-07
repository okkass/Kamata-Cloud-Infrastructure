<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">ネットワーク (NIC)</h3>
      <FormSelect
        label="サブネット (NIC 1)"
        name="vm-edit-subnet"
        v-model="firstNicSubnetId"
        :options="networks ?? []"
        option-value="id"
        option-label="name"
        placeholder="ネットワークが割り当てられていません"
        :pending="networksPending"
        :error="networksError"
        :error-message="errors['nics[0].subnetId']"
        :required="true"
        :placeholder-value="undefined"
        disabled
      />
      <p class="form-help">
        ※仮想マシンのサブネット（NIC）の変更・追加・削除は現在サポートされていません。
      </p>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">セキュリティグループ</h3>

      <div v-if="sgFields.length > 0" class="space-y-2 mb-4">
        <div
          v-for="(field, index) in sgFields"
          :key="field.key"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
        >
          <span class="font-medium text-gray-800">{{
            getGroupName(field.value)
          }}</span>
          <button
            type="button"
            @click="removeSg(index)"
            class="btn-icon-danger"
            title="セキュリティグループを解除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <p v-else class="text-gray-500 text-sm mb-4">
        適用中のセキュリティグループはありません。
      </p>

      <div>
        <label for="sg-add-select" class="form-label-sm"
          >セキュリティグループを追加</label
        >
        <div class="flex items-center gap-3">
          <div class="flex-grow">
            <FormSelect
              :label="undefined"
              name="vm-edit-sg-add"
              v-model="selectedGroupToAdd"
              :options="availableGroups ?? []"
              option-value="id"
              option-label="name"
              placeholder="グループを選択..."
              :pending="sgPending"
              :error="sgError"
              :placeholder-value="null"
            />
          </div>
          <button
            type="button"
            @click="addSg"
            :disabled="!selectedGroupToAdd"
            class="btn-secondary"
          >
            追加
          </button>
        </div>
        <p v-if="errors.securityGroupIds" class="text-error mt-1">
          {{ errors.securityGroupIds }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * VM編集モーダル: ネットワークタブ (VmEditTabNetwork.vue)
 * ---------------------------------------------------------------------------------
 * このコンポーネントは、VM編集モーダルの「ネットワーク」タブのUIとフォームロジックを
 * 自己完結して管理します。
 * * 責務:
 * 1. 自身のフォーム (NIC配列, セキュリティグループ配列) の状態とバリデーション (VeeValidate) を管理する。
 * 2. フォームに必要なデータ (VPC/サブネット一覧, SG一覧) をAPI (useResourceList) から取得する。
 * 3. 適用中SGと追加可能SGのUIロジックを管理する。
 * 4. 親コンポーネントが必要とするインターフェース (validate, resetForm, etc.) を
 * `defineExpose` で公開する。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
// ★ 共通コンポーネントをインポート
import FormSelect from "~/components/FormSelect.vue";
// ★ 共有型定義をインポート
import type { VirtualNetworkDTO } from "~~/shared/types/virtual-networks";
import type { SecurityGroupDTO } from "~~/shared/types/security-groups";
import type { NetworkInterfaceDTO } from "~~/shared/types/virtual-machines";

// ==============================================================================
// API (ドロップダウン用データ取得)
// ==============================================================================

// 1. 仮想ネットワーク (サブネット) 一覧の取得
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetworkDTO>("virtual-networks");

// 2. セキュリティグループ一覧の取得
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-groups");

// ==============================================================================
// Validation Schema (バリデーション定義)
// ==============================================================================
// (NetworkInterfaceDTO)
const nicSchema = z.object({
  id: z.string(),
  subnetId: z.string().nullable(),
  name: z.string(),
  macAddress: z.string(),
  ipAddress: z.string(),
});

const validationSchema = toTypedSchema(
  z.object({
    // nics 配列 (親から渡される)
    nics: z.array(nicSchema).optional(),
    // securityGroupIds は文字列の配列
    // (例: 少なくとも1つ選択必須にする場合は .min(1, "セキュリティグループが1つも選択されていません。"))
    securityGroupIds: z.array(z.string()),
  })
);

// ==============================================================================
// Form Setup (VeeValidate)
// ==============================================================================
const {
  errors,
  defineField,
  values,
  meta,
  resetForm,
  validate,
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues: {
    nics: [] as NetworkInterfaceDTO[], // 親から初期値を受け取る
    securityGroupIds: [] as string[],
  },
});

// --- NICs (Subnet) ---
// このタブではNICの変更を許可しないため、`useFieldArray` は使用しない。
// v-model のために、最初のNICのsubnetIdへのcomputed refを作成
const firstNicSubnetId = computed({
  get: () => values.nics?.[0]?.subnetId || null,
  set: (value) => {
    // 基本的に disabled だが、VeeValidateが値を設定しようとする場合に備える
    if (values.nics && values.nics[0]) {
      setFieldValue("nics[0].subnetId", value);
    }
  },
});

// --- Security Groups (動的配列) ---
const {
  fields: sgFields,
  push: pushSg,
  remove: removeSg,
} = useFieldArray<string>("securityGroupIds");

// ==============================================================================
// UIロジック (セキュリティグループ追加)
// ==============================================================================
// 追加用プルダウンで選択されているグループID (v-model)
const selectedGroupToAdd = ref<string | null>(null);

// 適用済みのグループを除外した、追加可能なグループのリスト
const availableGroups = computed(() => {
  const appliedIds = new Set(values.securityGroupIds || []);
  return securityGroups.value?.filter((sg) => !appliedIds.has(sg.id)) || [];
});

// IDからグループ名を取得するヘルパー関数 (適用済みリスト表示用)
const getGroupName = (id: string) => {
  return securityGroups.value?.find((sg) => sg.id === id)?.name || id;
};

// 「追加」ボタン押下時の処理
const addSg = () => {
  if (selectedGroupToAdd.value) {
    // 既に適用されていないか念のためチェック
    if (!values.securityGroupIds?.includes(selectedGroupToAdd.value)) {
      pushSg(selectedGroupToAdd.value); // 配列 (values.securityGroupIds) にIDを追加
    }
    selectedGroupToAdd.value = null; // 選択プルダウンをリセット
  }
};

// ==============================================================================
// Expose (親へのインターフェース公開)
// ==============================================================================
defineExpose({
  validate, // バリデーション実行関数
  resetForm, // フォーム初期化関数
  values, // フォームの現在の値 (ref)
  meta, // フォームのバリデーション状態 (ref)
});
</script>

<style scoped>
/*
  共通スタイルシート (tailwind.css) で定義されているクラスを使用するため、
  このコンポーネント固有のスタイルは不要。
*/
</style>
