<template>
  <div class="border rounded-md overflow-hidden bg-white">
    <div
      class="bg-gray-100 px-4 py-2 border-b flex justify-between items-center"
    >
      <h3 class="font-bold text-sm text-gray-700">{{ title }}</h3>
      <button
        type="button"
        @click="$emit('add-rule')"
        class="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded shadow-sm transition-colors"
      >
        + 追加
      </button>
    </div>

    <div class="p-4">
      <div
        v-if="rules.length === 0"
        class="text-center text-gray-400 py-4 text-sm"
      >
        ルールがありません。
      </div>

      <div v-else class="space-y-4">
        <div v-for="(rule, index) in rules" :key="rule.id" class="rule-row">
          <div class="grid grid-cols-12 gap-2 items-start">
            <div class="col-span-4">
              <label class="block text-xs text-gray-500 mb-1">名前</label>
              <input
                type="text"
                v-model="rule.name"
                class="form-input-sm w-full"
                :class="{ 'border-red-500': getError(rule, index, 'name') }"
                placeholder="ルール名"
              />
            </div>

            <div class="col-span-3">
              <label class="block text-xs text-gray-500 mb-1">プロトコル</label>
              <select v-model="rule.protocol" class="form-select-sm w-full">
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div class="col-span-3">
              <label class="block text-xs text-gray-500 mb-1">ポート</label>
              <input
                type="number"
                v-model.number="rule.port"
                class="form-input-sm w-full"
                placeholder="Any"
                :class="{ 'border-red-500': getError(rule, index, 'port') }"
              />
            </div>

            <div class="col-span-2 flex justify-end pt-6">
              <button
                type="button"
                @click="$emit('delete-rule', rule.id)"
                class="text-red-500 hover:text-red-700 p-1"
                title="削除"
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
            </div>
          </div>

          <div class="grid grid-cols-12 gap-2 items-start mt-2">
            <div class="col-span-8">
              <label class="block text-xs text-gray-500 mb-1"
                >送信元/宛先 IP</label
              >
              <input
                type="text"
                v-model="rule.targetIp"
                class="form-input-sm w-full"
                :class="{ 'border-red-500': getError(rule, index, 'targetIp') }"
                placeholder="0.0.0.0/0"
              />
            </div>

            <div class="col-span-4">
              <label class="block text-xs text-gray-500 mb-1">アクション</label>
              <select v-model="rule.action" class="form-select-sm w-full">
                <option value="allow">許可 (Allow)</option>
                <option value="deny">拒否 (Deny)</option>
              </select>
            </div>
          </div>

          <div
            v-if="hasRowError(rule, index)"
            class="text-xs text-red-500 mt-1 pl-1"
          >
            {{ getRowErrorMessage(rule, index) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
// 型定義はプロジェクトに合わせてください (Create用DTOなど)
interface RuleItem {
  id: string; // 必須！
  name: string;
  protocol: string;
  port?: number | null;
  targetIp: string;
  action: string;
}

const props = defineProps({
  title: { type: String, default: "ルール" },
  rules: { type: Array as PropType<any[]>, default: () => [] },
  errors: {
    type: Object as PropType<Record<string, string | undefined>>,
    default: () => ({}),
  },
  fieldNamePrefix: { type: String, required: true }, // 'inboundRules' など
});

defineEmits<{
  (e: "add-rule"): void;
  (e: "delete-rule", id: string): void;
}>();

// --- ハイブリッドエラー判定 ---
// 編集画面は「IDベース」、作成画面(VeeValidate)は「Indexベース」でエラーが来るため、両方チェックする

const getError = (rule: RuleItem, index: number, field: string) => {
  // パターン1: IDベース (編集画面) -> "uuid-123.name"
  const idKey = `${rule.id}.${field}`;
  if (props.errors[idKey]) return props.errors[idKey];

  // パターン2: Indexベース (VeeValidate/作成画面) -> "inboundRules[0].name"
  const indexKey = `${props.fieldNamePrefix}[${index}].${field}`;
  if (props.errors[indexKey]) return props.errors[indexKey];

  return undefined;
};

const hasRowError = (rule: RuleItem, index: number) => {
  const idPrefix = `${rule.id}.`;
  const indexPrefix = `${props.fieldNamePrefix}[${index}].`;

  return Object.keys(props.errors).some(
    (k) => k.startsWith(idPrefix) || k.startsWith(indexPrefix)
  );
};

const getRowErrorMessage = (rule: RuleItem, index: number) => {
  const nameErr = getError(rule, index, "name");
  const targetErr = getError(rule, index, "targetIp");
  const portErr = getError(rule, index, "port");

  const messages = [];
  if (nameErr) messages.push(`名前: ${nameErr}`);
  if (targetErr) messages.push(`IP: ${targetErr}`);
  if (portErr) messages.push(`ポート: ${portErr}`);

  return messages.join(" / ");
};
</script>

<style scoped>
.form-input-sm,
.form-select-sm {
  @apply border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500;
}
.rule-row {
  @apply border-b border-gray-100 pb-4 mb-4;
}
.rule-row:last-child {
  @apply border-b-0 pb-0 mb-0;
}
</style>
