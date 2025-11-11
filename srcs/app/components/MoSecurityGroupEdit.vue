<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ編集"
    @close="$emit('close')"
  >
    <form v-if="values" @submit.prevent="onSubmit" class="space-y-6">
      <div class="space-y-4">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name-edit"
          v-model="name"
          v-model:attrs="nameAttrs"
          :error="errors.name"
          :required="true"
        />
        <FormTextarea
          label="説明"
          name="sg-description-edit"
          :rows="3"
          v-model="description"
          v-model:attrs="descriptionAttrs"
          :error="errors.description"
        />
      </div>

      <RuleTable
        title="インバウンドルール"
        :rules="inboundFields"
        :errors="errors"
        field-name-prefix="inboundRules"
        @add-rule="addInboundRule"
        @delete-rule="removeInbound"
      />

      <RuleTable
        title="アウトバウンドルール"
        :rules="outboundFields"
        :errors="errors"
        field-name-prefix="outboundRules"
        @add-rule="addOutboundRule"
        @delete-rule="removeOutbound"
      />
    </form>
    <div v-else class="text-center text-gray-500">
      編集するデータを読み込んでいます...
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <button type="button" class="btn btn-back" @click="$emit('close')">
          キャンセル
        </button>
        <button type="button" @click="onSubmit" class="btn btn-primary">
          保存
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, type PropType } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import RuleTable from "~/components/RuleTable.vue";

// --- Props & Emits ---
const props = defineProps({
  show: { type: Boolean, required: true },
  securityGroupData: {
    type: Object as PropType<SecurityGroupDTO | null>,
    default: null,
  },
});
const emit = defineEmits(["close", "save"]);

// ★ 1. Zodスキーマを定義（作成時と共通）
const ruleSchema = z.object({
  id: z.string().optional(),
  protocol: z.string(),
  port: z.string().optional(),
  portRange: z.string().optional(),
  sourceIp: z.string().optional(),
  sourceType: z.string().optional(),
  source: z.string().optional(),
  destinationType: z.string().optional(),
  destination: z.string().optional(),
  description: z.string().optional(),
});
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "セキュリティグループ名は必須です。"),
    description: z.string().optional(),
    inboundRules: z.array(ruleSchema),
    outboundRules: z.array(ruleSchema),
  })
);

// ★ 2. vee-validateのuseFormをセットアップ（initialValuesはここでは設定しない）
const { errors, defineField, values, resetForm, handleSubmit } = useForm({
  validationSchema,
});

// 静的フィールドと動的配列フィールドを定義
const [name, nameAttrs] = defineField("name");
const [description, descriptionAttrs] = defineField("description");
const {
  fields: inboundFields,
  push: pushInbound,
  remove: removeInbound,
} = useFieldArray("inboundRules");
const {
  fields: outboundFields,
  push: pushOutbound,
  remove: removeOutbound,
} = useFieldArray("outboundRules");

watch(
  () => props.securityGroupData,
  (newData) => {
    if (newData && newData.rules) {
      // フォーム用のデータ構造を作成
      const formValues = {
        ...newData,
        // 'inbound'のルールだけを抽出・変換
        inboundRules: newData.rules
          .filter((rule) => rule.ruleType === "inbound")
          .map((rule) => ({
            id: rule.id, // ★ APIとフォームで共通のキー
            protocol: rule.protocol.toUpperCase(), // 'tcp' -> 'TCP'
            port:
              rule.port !== undefined && rule.port !== null
                ? String(rule.port)
                : "",
            sourceIp: rule.targetIp, // ★ targetIp -> sourceIp
          })),
        // 'outbound'のルールだけを抽出・変換
        outboundRules: newData.rules
          .filter((rule) => rule.ruleType === "outbound")
          .map((rule) => ({
            id: rule.id,
            protocol: rule.protocol.toUpperCase(),
            port:
              rule.port !== undefined && rule.port !== null
                ? String(rule.port)
                : "",
            sourceIp: rule.targetIp,
          })),
      };

      // 変換したデータをフォームにセット
      resetForm({
        values: formValues,
      });
    }
  },
  { immediate: true, deep: true }
);

// ルール追加・削除のメソッド
const addInboundRule = () => {
  pushInbound({
    protocol: "TCP",
    portRange: "",
    sourceType: "cidr",
    source: "",
    description: "",
  });
};
const addOutboundRule = () => {
  pushOutbound({
    protocol: "TCP",
    portRange: "",
    destinationType: "cidr",
    destination: "",
    description: "",
  });
};

const onSubmit = handleSubmit((formValues) => {
  // フォームのデータをAPIの形式に再変換
  const payload = {
    name: formValues.name,
    description: formValues.description,
    rules: [
      ...formValues.inboundRules.map((rule) => ({
        ...rule,
        ruleType: "inbound",
        targetIP: rule.sourceIp, // ★ sourceIp -> targetIP
        protocol: rule.protocol.toLowerCase(), // 'TCP' -> 'tcp'
      })),
      ...formValues.outboundRules.map((rule) => ({
        ...rule,
        ruleType: "outbound",
        targetIP: rule.sourceIp,
        protocol: rule.protocol.toLowerCase(),
      })),
    ],
  };

  console.log("APIに送信するデータ:", payload);
  // ここでAPI呼び出しを実行
  // executeUpdate(props.securityGroupData.id, payload);

  emit("save", payload);
  emit("close");
});
</script>
