<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ作成"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <div class="space-y-4">
          <div>
            <label for="sg-name" class="form-label"
              >セキュリティグループ名</label
            >
            <input
              id="sg-name"
              type="text"
              v-model="securityGroup.name"
              class="form-input"
            />
          </div>
          <div>
            <label for="sg-description" class="form-label">説明</label>
            <textarea
              id="sg-description"
              rows="3"
              v-model="securityGroup.description"
              class="form-input"
            ></textarea>
          </div>
        </div>

        <RuleTable
          title="インバウンドルール"
          :rules="securityGroup.inboundRules"
          @add-rule="addRule('inbound')"
          @delete-rule="deleteRule('inbound', $event)"
        />

        <RuleTable
          title="アウトバウンドルール"
          :rules="securityGroup.outboundRules"
          @add-rule="addRule('outbound')"
          @delete-rule="deleteRule('outbound', $event)"
        />
      </div>

      <div class="flex justify-end mt-8 pt-4 border-t">
        <button @click="createSecurityGroup" class="btn-primary">作成</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import RuleTable from "~/components/RuleTable.vue"; // ルールテーブルを別コンポーネントとしてインポート

// ==============================================================================
// Props & Emits
// ==============================================================================
defineProps({
  show: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "create"]);

// ==============================================================================
// State
// ==============================================================================
// 作成するセキュリティグループのデータを管理
const securityGroup = ref({
  name: "",
  description: "",
  inboundRules: [],
  outboundRules: [],
});

let nextRuleId = 0; // ルールの一意なIDを管理

// ==============================================================================
// Methods
// ==============================================================================
/**
 * 新しいルールを追加する
 * @param {'inbound' | 'outbound'} type - ルールの種類
 */
const addRule = (type) => {
  const newRule = {
    id: nextRuleId++,
    name: "",
    port: "",
    protocol: "TCP",
    sourceIp: "",
    action: "許容",
  };
  if (type === "inbound") {
    securityGroup.value.inboundRules.push(newRule);
  } else {
    securityGroup.value.outboundRules.push(newRule);
  }
};

/**
 * 指定されたルールを削除する
 * @param {'inbound' | 'outbound'} type - ルールの種類
 * @param {number} ruleId - 削除するルールのID
 */
const deleteRule = (type, ruleId) => {
  if (type === "inbound") {
    securityGroup.value.inboundRules = securityGroup.value.inboundRules.filter(
      (rule) => rule.id !== ruleId
    );
  } else {
    securityGroup.value.outboundRules =
      securityGroup.value.outboundRules.filter((rule) => rule.id !== ruleId);
  }
};

/**
 * セキュリティグループを作成する
 */
const handleSubmit = () => {
  console.log("作成データ:", securityGroup.value);
  alert(`セキュリティグループ「${securityGroup.value.name}」を作成しました。`);
  emit("create", securityGroup.value);
  emit("close");
};
</script>

<style scoped>
/* 共通スタイルを@applyで定義 */
.form-label {
  @apply block mb-1.5 font-semibold text-gray-700;
}
.form-input {
  @apply w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700;
}
</style>
