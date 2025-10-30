<template>
  <div class="space-y-6">
    <div class="form-section space-y-4">
      <h3 class="section-title">ネットワーク</h3>
      <div>
        <label for="network-select" class="form-label-sm">サブネット</label>
        <div v-if="networksPending" class="text-gray-500">...</div>
        <div v-else-if="networksError" class="text-red-500">取得失敗</div>
        <select
          v-else
          id="network-select"
          v-model="subnetId"
          v-bind="subnetIdAttrs"
          class="form-input"
          :class="{ 'border-red-500': errors.subnetId }"
          disabled
        >
          <option :value="undefined" disabled>
            ネットワークを選択してください
          </option>
          <option
            v-for="network in networks"
            :key="network.id"
            :value="network.id"
          >
            {{ network.name }} ({{ network.cidr }})
          </option>
        </select>
        <p v-if="errors.subnetId" class="text-red-500 text-sm mt-1">
          {{ errors.subnetId }}
        </p>
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
              >
                &times;
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="sgPending">...</div>
      <div v-else-if="sgError" class="text-red-500">取得失敗</div>
      <div v-else class="flex items-center gap-3 mt-4">
        <select v-model="selectedGroupToAdd" class="form-input flex-grow">
          <option :value="null" disabled>追加するグループを選択</option>
          <option
            v-for="group in availableGroups"
            :key="group.id"
            :value="group.id"
          >
            {{ group.name }}
          </option>
        </select>
        <button type="button" @click="addSg" class="btn-secondary">追加</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useResourceList } from "~/composables/useResourceList";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// ==============================================================================
// 型定義
// ==============================================================================
interface ModelVirtualNetworkDTO {
  id: string;
  name: string;
  cidr: string;
}
interface ModelSecurityGroupDTO {
  id: string;
  name: string;
}

// ==============================================================================
// バリデーション
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    // サブネットは編集不可だが、値自体は存在する必要がある
    subnetId: z.string({ required_error: "ネットワークは必須です。" }),
    // securityGroupIdsは文字列の配列
    securityGroupIds: z.array(z.string()),
  })
);

const { errors, defineField, values, meta, resetForm } = useForm({
  validationSchema,
});

const [subnetId, subnetIdAttrs] = defineField("subnetId");
const {
  fields: sgFields,
  push: pushSg,
  remove: removeSg,
} = useFieldArray<string>("securityGroupIds");

defineExpose({ formData: values, isValid: meta, resetForm });

// ==============================================================================
// API連携
// ==============================================================================
const {
  data: networks,
  pending: networksPending,
  error: networksError,
} = useResourceList<ModelVirtualNetworkDTO>("virtual-networks");

const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<ModelSecurityGroupDTO>("security-groups");

// ==============================================================================
// UI操作
// ==============================================================================
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

const addSg = () => {
  if (selectedGroupToAdd.value) {
    pushSg(selectedGroupToAdd.value);
    selectedGroupToAdd.value = null; // 選択をリセット
  }
};
</script>

<style scoped>
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
</style>
