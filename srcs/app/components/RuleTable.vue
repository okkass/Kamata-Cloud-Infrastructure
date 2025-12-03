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
              <select
                v-model="rule.protocol"
                @change="handleProtocolChange(rule)"
                class="form-select-sm w-full"
              >
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
                :class="{
                  'border-red-500': getError(rule, index, 'port'),
                  'bg-gray-100 text-gray-400 cursor-not-allowed':
                    isPortDisabled(rule.protocol),
                }"
                placeholder="Any"
                :disabled="isPortDisabled(rule.protocol)"
              />
            </div>

            <div class="col-span-2 flex justify-end pt-6">
              <button
                type="button"
                @click="$emit('delete-rule', index)"
                class="text-red-500 hover:text-red-700 text-xs underline"
              >
                削除
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
                :class="{
                  'border-red-500': getError(rule, index, 'targetIp'),
                }"
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

          <div v-if="hasRowError(rule, index)" class="mt-1">
            <p
              v-for="msg in getRowErrorMessage(rule, index)"
              :key="msg"
              class="text-xs text-red-500"
            >
              {{ msg }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * ルール編集テーブル (RuleTable.vue)
 * =================================================================================
 */
import type { PropType } from "vue";

// ルールの型定義（最低限必要なプロパティ）
interface RuleItem {
  id: string;
  name: string;
  protocol: string;
  port: number | null;
  targetIp: string;
  action: string;
}

const props = defineProps({
  title: {
    type: String,
    default: "ルール",
  },
  rules: {
    type: Array as PropType<RuleItem[]>,
    default: () => [],
  },
  // エラーオブジェクト (undefined許容)
  errors: {
    type: Object as PropType<Record<string, string | undefined>>,
    default: () => ({}),
  },
  fieldNamePrefix: {
    type: String,
    required: true,
  },
});

defineEmits(["add-rule", "delete-rule"]);

// --- ロジック追加部分 ---

/**
 * ポート入力を無効化すべきプロトコルかどうか判定
 * ICMP または Any の場合はポート指定不要のため true を返す
 */
const isPortDisabled = (protocol: string): boolean => {
  const p = protocol.toLowerCase();
  return p === "icmp" || p === "any";
};

/**
 * プロトコル変更時のハンドラ
 * ICMP等に変更された場合、入力済みのポート番号をクリアする
 */
const handleProtocolChange = (rule: RuleItem) => {
  if (isPortDisabled(rule.protocol)) {
    rule.port = null;
  }
};

// --- エラー判定ロジック (既存のまま) ---

const getError = (rule: RuleItem, index: number, field: string) => {
  const idKey = `${rule.id}.${field}`;
  if (props.errors[idKey]) return props.errors[idKey];

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

  return messages;
};
</script>

<style scoped>
.form-input-sm,
.form-select-sm {
  @apply border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500;
}
.rule-row {
  @apply border-b border-gray-100 pb-4 mb-4;
}
.rule-row:last-child {
  @apply border-b-0 pb-0 mb-0;
}
/* 無効化時のスタイル補助 (Tailwindクラスで対応済みだが念のため) */
.cursor-not-allowed {
  cursor: not-allowed;
}
</style>
