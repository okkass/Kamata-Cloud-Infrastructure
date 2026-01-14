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
        <div
          v-for="(rule, index) in displayRules"
          :key="getKey(rule, index)"
          class="rule-row"
        >
          <div class="grid grid-cols-12 gap-2 items-start">
            <div class="col-span-4">
              <FormInput
                :name="`rule-name-${index}`"
                label="名前"
                v-model="rule.name"
                :error="getError(index, 'name')"
                placeholder="ルール名"
                class="py-1 text-sm"
              />
            </div>

            <div class="col-span-3">
              <FormSelect
                :name="`rule-protocol-${index}`"
                label="プロトコル"
                v-model="rule.protocol"
                :options="protocolOptions"
                @change="onProtocolChange(rule)"
                placeholder="選択してください"
                placeholderValue=""
                required
                class="py-1 text-sm"
              />
            </div>

            <div class="col-span-3">
              <FormInput
                :name="`rule-port-${index}`"
                label="ポート"
                type="number"
                v-model.number="rule.port"
                :error="getError(index, 'port')"
                placeholder="Any"
                :disabled="isPortDisabled(rule.protocol)"
                class="py-1 text-sm"
              />
            </div>

            <div class="col-span-2 flex justify-end pt-5">
              <button
                type="button"
                @click="$emit('delete-rule', index)"
                class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                title="削除"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-2 items-start mt-2">
            <div class="col-span-8">
              <FormInput
                :name="`rule-targetIp-${index}`"
                label="送信元/宛先 IP"
                v-model="rule.targetIp"
                :error="getError(index, 'targetIp')"
                placeholder="0.0.0.0/0"
                class="py-1 text-sm"
              />
            </div>
            <div class="col-span-4">
              <FormSelect
                :name="`rule-action-${index}`"
                label="アクション"
                v-model="rule.action"
                :options="actionOptions"
                placeholder="選択してください"
                placeholderValue=""
                required
                class="py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";

interface RuleItem {
  id: string;
  name: string;
  protocol: string;
  port: number | null;
  targetIp: string;
  action: string;
}

const props = defineProps({
  title: { type: String, default: "ルール" },
  // どんな形式の配列でも受け取れるように any[] に緩和
  rules: { type: Array as PropType<any[]>, default: () => [] },
  errors: {
    type: Object as PropType<Record<string, string | undefined>>,
    default: () => ({}),
  },
  fieldNamePrefix: { type: String, required: true },
});

defineEmits(["add-rule", "delete-rule"]);

// データ整形: displayRules
// rules の中身が { value: {...} } (VeeValidate形式) でも、普通のオブジェクトでも
// 統一して扱えるように変換する
const displayRules = computed(() => {
  return props.rules.map((item) => {
    // もし .value プロパティを持っていればそれを返す（VeeValidate useFieldArray対策）
    // なければ item そのものを返す
    return item && typeof item === "object" && "value" in item
      ? item.value
      : item;
  });
});

// v-forのキー取得用
const getKey = (rule: any, index: number) => {
  return rule.id || index;
};

const protocolOptions = [
  { id: "tcp", name: "TCP" },
  { id: "udp", name: "UDP" },
  { id: "icmp", name: "ICMP" },
  { id: "any", name: "Any" },
];

const actionOptions = [
  { id: "allow", name: "許可 (Allow)" },
  { id: "deny", name: "拒否 (Deny)" },
];

// --- ヘルパーメソッド ---
const isPortDisabled = (protocol: string) => {
  const p = protocol ? protocol.toLowerCase() : "";
  return p === "icmp" || p === "any";
};

const onProtocolChange = (rule: RuleItem) => {
  if (isPortDisabled(rule.protocol)) {
    rule.port = null;
  }
};

// --- エラー判定ロジック ---
// 引数から `rule` を削除し、index だけで判定するように変更 (displayRulesを使うため)
const getError = (index: number, field: string) => {
  // ブラケット記法 (inboundRules[0].name)
  const bracketKey = `${props.fieldNamePrefix}[${index}].${field}`;
  // ドット記法 (inboundRules.0.name)
  const dotKey = `${props.fieldNamePrefix}.${index}.${field}`;

  return props.errors[bracketKey] || props.errors[dotKey];
};
</script>

<style scoped>
.rule-row {
  @apply border-b border-gray-100 pb-4 mb-4;
}
.rule-row:last-child {
  @apply border-b-0 pb-0 mb-0;
}
.cursor-not-allowed {
  cursor: not-allowed;
}
</style>
