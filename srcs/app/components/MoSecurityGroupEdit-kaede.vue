<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ編集"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <div class="space-y-4">
        <div>
          <label for="sg-name-edit" class="form-label"
            >セキュリティグループ名</label
          >
          <input
            id="sg-name-edit"
            type="text"
            v-model="editableSecurityGroup.name"
            class="form-input"
          />
        </div>
        <div>
          <label for="sg-description-edit" class="form-label">説明</label>
          <textarea
            id="sg-description-edit"
            rows="3"
            v-model="editableSecurityGroup.description"
            class="form-input"
          ></textarea>
        </div>
      </div>

      <RuleTable
        title="インバウンドルール"
        :rules="editableSecurityGroup.inboundRules"
        @add-rule="addRule('inbound')"
        @delete-rule="deleteRule('inbound', $event)"
      />

      <RuleTable
        title="アウトバウンドルール"
        :rules="editableSecurityGroup.outboundRules"
        @add-rule="addRule('outbound')"
        @delete-rule="deleteRule('outbound', $event)"
      />
    </div>

    <div class="flex justify-end gap-3 mt-8 pt-4 border-t">
      <SecondaryButton @click="$emit('close')"> キャンセル </SecondaryButton>
      <button @click="saveChanges" class="btn-primary">保存</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";
import RuleTable from "~/components/RuleTable.vue"; // 子コンポーネントをインポート

// ==============================================================================
// Props & Emits
// ==============================================================================
const props = defineProps({
  show: { type: Boolean, required: true },
  // APIから取得した編集対象のセキュリティグループデータを想定
  securityGroupData: {
    type: Object,
    required: true,
    // 親からデータが渡されない場合のダミーデータ
    default: () => ({
      id: "sg-001",
      name: "web-server-rules",
      description: "Webサーバー用の基本的なルールセット",
      inboundRules: [
        {
          id: 0,
          name: "allow-http",
          port: "80",
          protocol: "TCP",
          sourceIp: "0.0.0.0/0",
          action: "許容",
        },
        {
          id: 1,
          name: "allow-https",
          port: "443",
          protocol: "TCP",
          sourceIp: "0.0.0.0/0",
          action: "許容",
        },
      ],
      outboundRules: [],
    }),
  },
});
const emit = defineEmits(["close", "save"]);

// ==============================================================================
// State
// ==============================================================================
// propsで受け取ったデータを編集するためのローカルコピーを作成
const editableSecurityGroup = ref(
  JSON.parse(JSON.stringify(props.securityGroupData))
);
let nextRuleId = ref(100); // 既存のルールIDと重複しないように初期値を設定

// propsのデータが変更されたら、ローカルコピーも更新する
watch(
  () => props.securityGroupData,
  (newData) => {
    editableSecurityGroup.value = JSON.parse(JSON.stringify(newData));
  },
  { deep: true }
);

// ==============================================================================
// Methods
// ==============================================================================
/**
 * 新しいルールを追加する
 * @param {'inbound' | 'outbound'} type - ルールの種類
 */
const addRule = (type) => {
  const newRule = {
    id: nextRuleId.value++,
    name: "",
    port: "",
    protocol: "TCP",
    sourceIp: "",
    action: "許容",
  };
  if (type === "inbound") {
    editableSecurityGroup.value.inboundRules.push(newRule);
  } else {
    editableSecurityGroup.value.outboundRules.push(newRule);
  }
};

/**
 * 指定されたルールを削除する
 * @param {'inbound' | 'outbound'} type - ルールの種類
 * @param {number} ruleId - 削除するルールのID
 */
const deleteRule = (type, ruleId) => {
  if (type === "inbound") {
    editableSecurityGroup.value.inboundRules =
      editableSecurityGroup.value.inboundRules.filter(
        (rule) => rule.id !== ruleId
      );
  } else {
    editableSecurityGroup.value.outboundRules =
      editableSecurityGroup.value.outboundRules.filter(
        (rule) => rule.id !== ruleId
      );
  }
};

/**
 * 変更を保存する
 */
const saveChanges = () => {
  console.log("保存データ:", editableSecurityGroup.value);
  alert(
    `セキュリティグループ「${editableSecurityGroup.value.name}」の変更を保存しました。`
  );
  emit("save", editableSecurityGroup.value);
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
