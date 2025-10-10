<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ作成"
    @close="$emit('close')"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <div class="space-y-4">
        <FormInput
          label="セキュリティグループ名"
          name="sg-name"
          v-model="name"
          v-model:attrs="nameAttrs"
          :error="errors.name"
        />
        <FormTextarea
          label="説明"
          name="sg-description"
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

    <template #footer>
      <div class="flex justify-end w-full">
        <button @click="onSubmit" class="btn btn-primary">作成</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// --- Props & Emits ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "create"]);

// ★ 1. Zodでルール一行のスキーマを定義
const ruleSchema = z.object({
  protocol: z.enum(["TCP", "UDP", "ICMP"]),
  port: z.string().optional().nullable(), // ポートは文字列として扱い、後で数値に変換
  sourceIp: z.string().ip({ message: "有効なIPアドレスを入力してください。" }),
});

// ★ 2. Zodでフォーム全体のスキーマを定義
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "セキュリティグループ名は必須です。"),
    description: z.string().optional(),
    inboundRules: z.array(ruleSchema),
    outboundRules: z.array(ruleSchema),
  })
);

// ★ 3. vee-validateのuseFormをセットアップ
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    description: "",
    inboundRules: [],
    outboundRules: [],
  },
});

// 静的なフィールドを定義
const [name, nameAttrs] = defineField("name");
const [description, descriptionAttrs] = defineField("description");

// ★ 4. useFieldArrayで動的なルールリストを管理
const { fields: inboundFields, push: pushInbound, remove: removeInbound } = useFieldArray("inboundRules");
const { fields: outboundFields, push: pushOutbound, remove: removeOutbound } = useFieldArray("outboundRules");

// ★ 5. ルール追加・削除のメソッドをvee-validateの関数に置き換え
const addInboundRule = () => {
  pushInbound({ protocol: "TCP", port: "", sourceIp: "0.0.0.0/0" });
};
const addOutboundRule = () => {
  pushOutbound({ protocol: "TCP", port: "", sourceIp: "0.0.0.0/0" });
};

// ★ 6. handleSubmitで送信処理をラップ
const onSubmit = handleSubmit((values) => {
  console.log("作成データ:", values);
  alert(`セキュリティグループ「${values.name}」を作成しました。`);
  emit("create", values);
  emit("close");
});
</script>