<template>
  <div>
    <label class="form-label-sm">{{ label }}</label>

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

    <p v-if="errors[name]" class="text-error h-5">
      {{ errors[name] }}
    </p>

    <table class="w-full text-sm text-left text-gray-700 mt-4">
      <thead class="text-xs text-gray-800 uppercase bg-gray-100">
        <tr>
          <th class="px-4 py-2">適用するグループ名</th>
          <th class="px-4 py-2 text-center w-20">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="fields.length === 0">
          <td colspan="2" class="text-center py-4 text-gray-500">
            セキュリティグループが選択されていません
          </td>
        </tr>
        <tr
          v-for="(field, index) in fields"
          :key="field.key"
          class="bg-white border-b"
        >
          <td class="px-4 py-2 font-medium">
            {{ getGroupName(field.value) }}
          </td>
          <td class="px-4 py-2 text-center">
            <button
              type="button"
              @click="remove(index)"
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
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * 汎用セキュリティグループ複数選択 (FormSecurityGroupSelect.vue)
 * ---------------------------------------------------------------------------------
 * セキュリティグループの Add/Remove リストパターンをカプセル化します。
 * VeeValidate (useFieldArray) と連携します。
 * =================================================================================
 */
import { ref, computed } from "vue";
import { useFieldArray } from "vee-validate";
import { useResourceList } from "~/composables/useResourceList";
import FormSelect from "~/components/Form/Select.vue";

// --- 型定義 (仮定) ---
interface SecurityGroupDTO {
  id: string;
  name: string;
}

// --- Props ---
const props = defineProps<{
  /** VeeValidateのフォームにおける配列のパス (例: "securityGroupIds") */
  name: string;
  /** 表示ラベル */
  label: string;
  /** 親の useForm から渡される errors オブジェクト */
  errors: Record<string, string | undefined>;
}>();

// ==============================================================================
// フォームロジック (VeeValidate)
// ==============================================================================
// ★ このコンポーネント内で useFieldArray を呼び出す
const {
  fields,
  push,
  remove,
  value: appliedIds,
} = useFieldArray<string>(props.name);

// ==============================================================================
// APIデータ取得
// ==============================================================================
// ★ このコンポーネントが自身で全SGリストを取得
const {
  data: securityGroups,
  pending: sgPending,
  error: sgError,
} = useResourceList<SecurityGroupDTO>("security-groups");

// ==============================================================================
// UIロジック
// ==============================================================================
// (TabNetwork.vue から移行したロジック)

const selectedGroupToAdd = ref<string | null>(null);

// 適用済みのグループを除外した、追加可能なグループのリスト
const availableGroups = computed(() => {
  const appliedIdSet = new Set(appliedIds.value || []);
  return securityGroups.value?.filter((sg) => !appliedIdSet.has(sg.id)) || [];
});

// IDからグループ名を取得するヘルパー関数
const getGroupName = (id: string) => {
  return securityGroups.value?.find((sg) => sg.id === id)?.name || id;
};

// 「追加」ボタンの処理
const addSecurityGroup = () => {
  if (selectedGroupToAdd.value) {
    push(selectedGroupToAdd.value); // useFieldArray の push を呼ぶ
    selectedGroupToAdd.value = null; // 選択をリセット
  }
};
</script>

<style scoped>
/* (もし btn-icon-danger がグローバルCSSになければ定義) */
.btn-icon-danger {
  @apply p-1.5 text-gray-400 rounded-md transition-colors;
  @apply hover:text-red-600 hover:bg-red-100;
  @apply focus:outline-none focus:ring-2 focus:ring-red-400;
}
</style>
