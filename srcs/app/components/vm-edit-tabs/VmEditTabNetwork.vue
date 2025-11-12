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
              適用中のセキュリティグループはありません。
            </td>
          </tr>
          <tr v-for="(group, index) in appliedGroups" :key="group.id">
            <td class="px-4 py-3">{{ group.name }}</td>
            <td class="px-4 py-3 text-center">
              <button
                type="button"
                @click="removeSg(index)"
                class="text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex items-end gap-3">
        <div class="flex-1">
          <FormSelect
            label="セキュリティグループを追加"
            name="vm-edit-sg-add"
            v-model="selectedGroupToAdd"
            :options="availableGroups ?? []"
            option-value="id"
            option-label="name"
            placeholder="グループを選択"
            :pending="sgPending"
            :error="sgError"
            :label-hidden="true"
          />
        </div>
        <button
          type="button"
          @click="addSecurityGroup"
          class="btn-secondary-outline"
          :disabled="!selectedGroupToAdd"
        >
          追加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * VM編集モーダル: ネットワークタブ (VmEditTabNetwork.vue)
 * ---------------------------------------------------------------------------------
 * 親 (MoVirtualMachineEdit) から initialData を props で受け取り、
 * VeeValidate の初期値に設定します。
 * =================================================================================
 */
import { ref, computed } from "vue"; // ★ computed をインポート
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useResourceList } from "~/composables/useResourceList";
import type { VirtualNetworkDTO } from "~~/shared/types/virtual-networks";
import type { SecurityGroupDTO } from "~~/shared/types/security-groups";

// =============================================================================
// Props (初期値受け取り)
// =============================================================================
// ★ 1. 親コンポーネントから初期値を受け取る
// (useVirtualMachineEdit.ts の getInitialDataForTab(2) が返す型)
const props = defineProps<{
  initialData: {
    nics: {
      id: string;
      subnetId: string | null;
      name: string;
      macAddress: string;
      ipAddress: string;
    }[];
    securityGroupIds: string[];
  };
}>();

// =============================================================================
// Data Fetching (ネットワーク & セキュリティグループ一覧)
// =============================================================================
// ★ 2. サブネット（ネットワーク）一覧を取得
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<VirtualNetworkDTO>("virtual-networks");

// ★ 3. セキュリティグループ一覧を取得
const {
  data: allSecurityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-groups");

// =============================================================================
// Validation Schema (バリデーション定義)
// =============================================================================
// ★ 4. バリデーション定義 (変更なし)
const nicSchema = z.object({
  id: z.string(),
  name: z.string(),
  macAddress: z.string(),
  ipAddress: z.string(),
  // ネットワークタブは編集 disabled だが、バリデーションのために定義
  subnetId: z.string().nullable(),
});

const validationSchema = toTypedSchema(
  z.object({
    nics: z.array(nicSchema),
    securityGroupIds: z.array(z.string()),
  })
);

// =============================================================================
// Form Setup (VeeValidate)
// =============================================================================
// ★ 5. フォームのセットアップ
const {
  errors,
  defineField,
  values,
  meta,
  validate,
  push: pushSg,
  remove: removeSg,
} = useForm({
  validationSchema,
  /**
   * ★ 6. 初期値を props.initialData から設定
   */
  initialValues: {
    // nics は配列ごと初期値として渡す (NICの追加/削除は非対応)
    nics: props.initialData.nics,
    // securityGroupIds はIDの配列
    securityGroupIds: props.initialData.securityGroupIds,
  },
});

// ★ 7. v-model ヘルパー (変更なし)
// NIC 1 (nics[0].subnetId) を v-model でバインド
const [firstNicSubnetId] = defineField("nics[0].subnetId");

// セキュリティグループ (FieldArray) の設定
const { fields: sgFields } = useFieldArray<string>("securityGroupIds");

// =============================================================================
// Security Group (SG) Logic
// =============================================================================
// ★ 8. セキュリティグループの追加ロジック (変更なし)

// 追加用プルダウンの v-model
const selectedGroupToAdd = ref<string | null>(null);

// 適用済みSG (values.securityGroupIds) と ID->名 辞書 (allSecurityGroups) を使って、
// v-for で表示するための {id, name} の配列を生成
const appliedGroups = computed(() => {
  const allSgsMap = new Map(
    allSecurityGroups.value?.map((g) => [g.id, g.name])
  );
  return values.securityGroupIds.map((id) => ({
    id: id,
    name: allSgsMap.get(id) || id, // 見つからなければIDをそのまま表示
  }));
});

// 追加用プルダウンに表示する「まだ適用されていない」SGのリスト
const availableGroups = computed(() => {
  const appliedIds = new Set(values.securityGroupIds);
  return (allSecurityGroups.value ?? []).filter((g) => !appliedIds.has(g.id));
});

// "追加" ボタン押下時の処理
const addSecurityGroup = () => {
  if (selectedGroupToAdd.value) {
    // (useFieldArray の pushSg を呼ぶ)
    pushSg(selectedGroupToAdd.value);
    selectedGroupToAdd.value = null; // 選択プルダウンをリセット
  }
};

// =============================================================================
// Expose (親へのインターフェース公開)
// =============================================================================
// ★ 9. 親 (useVirtualMachineEdit) が必要とするものだけを公開
// (resetForm は削除)
defineExpose({
  validate,
  values,
  meta,
});
</script>

<style scoped>
/* (スタイルは変更なし) */
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
.btn-secondary-outline {
  @apply py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50;
}
</style>
