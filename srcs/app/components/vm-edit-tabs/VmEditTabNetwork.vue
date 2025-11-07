<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">ネットワーク</h3>
      <div>
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
        <p class="text-xs text-gray-500 mt-1">
          ※サブネットの変更はできません。
        </p>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title mb-4">セキュリティグループ</h3>

      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs text-gray-800 uppercase bg-gray-100">
          <tr>
            <th class="px-4 py-2">グループ名</th>
            <th class="px-4 py-2 text-center w-20">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sgFields.length === 0">
            <td colspan="2" class="text-center py-4 text-gray-500">
              適用中のセキュリティグループはありません
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
                class="text-red-500 hover:text-red-700 font-bold text-xl"
                title="セキュリティグループを解除"
              >
                &times;
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center gap-3 mt-4">
        <div class="flex-grow">
          <FormSelect
            :label="undefined"
            name="vm-edit-sg-add"
            v-model="selectedGroupToAdd"
            :options="availableGroups ?? []"
            option-value="id"
            option-label="name"
            placeholder="追加するグループを選択..."
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
import type { SecurityGroupDTO } from "~~/shared/types/security-groups"; //
import type { NetworkInterfaceDTO } from "~~/shared/types/virtual-machines"; //

// ==============================================================================
// Props (親からの初期値)
// ==============================================================================
// ★ 親(useVirtualMachineEdit)から渡される初期データ
const props = defineProps<{
  initialData?: {
    nics: NetworkInterfaceDTO[];
    securityGroupIds: string[];
  };
}>();

// ==============================================================================
// API (ドロップダウン用データ取得)
// ==============================================================================

// 1. 仮想ネットワーク (サブネット) 一覧の取得
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetworkDTO>("virtual-networks"); //

// 2. セキュリティグループ一覧の取得
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-groups"); //

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
    // (注: サブネットは disabled なので、バリデーションは緩くても良い)
    nics: z.array(nicSchema).optional(),
    // securityGroupIdsは文字列の配列
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
  // ★ 親から渡された initialData を initialValues に設定
  initialValues: {
    nics: props.initialData?.nics || [],
    securityGroupIds: props.initialData?.securityGroupIds || [],
  },
});

// --- NICs (Subnet) ---
// このタブではNICの変更を許可しないため、`useFieldArray` は使用しない。
// v-model のために、最初のNICのsubnetIdへのcomputed refを作成
const firstNicSubnetId = computed({
  get: () => values.nics?.[0]?.subnetId || null,
  set: (value) => {
    // このフィールドは disabled だが、v-model のためにセッターを用意
    if (values.nics && values.nics[0]) {
      setFieldValue("nics[0].subnetId", value);
    }
  },
});

// --- Security Groups (動的配列) ---
// ★ any型を排除し、<string> (IDの配列) を指定
const {
  fields: sgFields,
  push: pushSg,
  remove: removeSg,
} = useFieldArray<string>("securityGroupIds");

// ==============================================================================
// UIロジック (セキュリティグループ追加)
// ==============================================================================
// (参考ファイル のロジックをそのまま流用)

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
  resetForm, // (親は使わないが、念のため公開)
  values, // フォームの現在の値 (ref)
  meta, // フォームのバリデーション状態 (ref)
});
</script>

<style scoped>
/*
  参考ファイル のスタイル定義をそのまま適用 
  (スタイルは極力変えないでください、という要件のため)
*/
.form-section {
  @apply p-4 border border-gray-200 rounded-lg;
}
.section-title {
  @apply font-semibold text-gray-800;
}
.form-label-sm {
  @apply block mb-1.5 text-sm font-medium text-gray-600;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.form-input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
.btn-secondary {
  @apply py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 whitespace-nowrap;
}
.form-help {
  @apply text-xs text-gray-500 mt-1;
}

/* 削除ボタン (&times;) のスタイル
  (参考ファイル のクラスを適用)
*/
.text-red-500 {
  color: #ef4444; /* (text-error と同等と仮定) */
}
.hover\:text-red-700:hover {
  color: #b91c1c;
}
.font-bold {
  font-weight: 700;
}
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
</style>
