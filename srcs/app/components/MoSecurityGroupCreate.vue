<template>
  <BaseModal
    :show="show"
    title="セキュリティグループ作成"
    @close="$emit('close')"
  >
    <form @submit.prevent="onFormSubmit" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label for="sg-name" class="form-label">
            セキュリティグループ名 <span class="required-asterisk">*</span>
          </label>
          <input
            id="sg-name"
            type="text"
            v-model="name"
            v-bind="nameAttrs"
            class="form-input"
            :class="{ 'form-border-error': errors.name }"
            placeholder="例: web-server-sg"
          />
          <p v-if="errors.name" class="text-error mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <label for="sg-description" class="form-label">説明</label>
          <textarea
            id="sg-description"
            :rows="3"
            v-model="description"
            v-bind="descriptionAttrs"
            class="form-input"
            :class="{ 'form-border-error': errors.description }"
            placeholder="例: Webサーバー用のHTTP/HTTPS通信を許可するグループ"
          ></textarea>
          <p v-if="errors.description" class="text-error mt-1">
            {{ errors.description }}
          </p>
        </div>
      </div>

      <RuleTable
        title="インバウンドルール"
        :rules="inboundRuleFields"
        :errors="errors"
        field-name-prefix="inboundRules"
        @add-rule="addInboundRule"
        @delete-rule="removeInboundRule"
      />

      <RuleTable
        title="アウトバウンドルール"
        :rules="outboundRuleFields"
        :errors="errors"
        field-name-prefix="outboundRules"
        @add-rule="addOutboundRule"
        @delete-rule="removeOutboundRule"
      />

      <div class="modal-footer">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          {{ isCreating ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * =================================================================================
 * セキュリティグループ作成モーダル (MoSecurityGroupCreate.vue)
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// --- 親コンポーネントとの連携 ---
defineProps({ show: { type: Boolean, required: true } });
const emit = defineEmits(["close", "success"]);

// ==============================================================================
// Type Definitions
// APIとの通信で使用するデータの型を定義します。
// ==============================================================================
interface SecurityGroupRuleForRequest {
  name: string; // ★ API仕様に合わせて`name`を追加
  ruleType: "inbound" | "outbound";
  protocol: "tcp" | "udp" | "icmp";
  port: number | null;
  targetIp: string;
  action: "allow";
}
interface SecurityGroupCreateRequestDTO {
  name: string;
  description?: string;
  rules: SecurityGroupRuleForRequest[];
}
interface SecurityGroupDTO {
  id: string;
  name: string;
}

// ==============================================================================
// Validation Schema
// ==============================================================================

// --- ルール一行分のスキーマ ---
const ruleSchema = z.object({
  name: z.string().min(1, "ルール名は必須です。"), // ★ ルール名も必須項目として追加
  protocol: z.enum(["TCP", "UDP", "ICMP"]),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z
      .number()
      .int("整数で入力")
      .min(1, "1-65535")
      .max(65535, "1-65535")
      .nullable()
  ),
  targetIp: z
    .string()
    .min(1, "入力必須")
    .regex(
      /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
      "有効なIPアドレスまたはCIDR形式で入力してください。"
    ),
});

// --- フォーム全体のスキーマ ---
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "セキュリティグループ名は必須です。"),
    description: z.string().optional(),
    inboundRules: z.array(ruleSchema),
    outboundRules: z.array(ruleSchema),
  })
);

// ==============================================================================
// Form Setup
// ==============================================================================
const { errors, defineField, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    description: "",
    inboundRules: [],
    outboundRules: [],
  },
});

const [name, nameAttrs] = defineField("name");
const [description, descriptionAttrs] = defineField("description");

const {
  fields: inboundRuleFields,
  push: pushInbound,
  remove: removeInboundRule,
} = useFieldArray("inboundRules");
const {
  fields: outboundRuleFields,
  push: pushOutbound,
  remove: removeOutboundRule,
} = useFieldArray("outboundRules");

// ★ ルール追加時に`name`の初期値も設定
const addInboundRule = () => {
  pushInbound({ name: "", protocol: "TCP", port: null, targetIp: "0.0.0.0/0" });
};
const addOutboundRule = () => {
  pushOutbound({
    name: "",
    protocol: "TCP",
    port: null,
    targetIp: "0.0.0.0/0",
  });
};

// ==============================================================================
// API Submission
// ==============================================================================
const { executeCreate: executeSecurityGroupCreation, isCreating } =
  useResourceCreate<SecurityGroupCreateRequestDTO, SecurityGroupDTO>(
    "security-groups"
  );
const { addToast } = useToast();

// ==============================================================================
// Event Handlers
// ==============================================================================
const onFormSubmit = handleSubmit(async (formValues) => {
  // ★★★ ペイロードの構築ロジックをAPI仕様に完全に一致させる ★★★
  const payload: SecurityGroupCreateRequestDTO = {
    name: formValues.name,
    description: formValues.description,
    rules: [
      ...formValues.inboundRules.map((rule) => ({
        name: rule.name,
        ruleType: "inbound" as const,
        protocol: rule.protocol.toLowerCase() as "tcp" | "udp" | "icmp",
        port: rule.port,
        targetIp: rule.targetIp,
        action: "allow" as const,
      })),
      ...formValues.outboundRules.map((rule) => ({
        name: rule.name,
        ruleType: "outbound" as const,
        protocol: rule.protocol.toLowerCase() as "tcp" | "udp" | "icmp",
        port: rule.port,
        targetIp: rule.targetIp,
        action: "allow" as const,
      })),
    ],
  };

  const result = await executeSecurityGroupCreation(payload);

  if (result.success) {
    addToast({
      type: "success",
      message: `セキュリティグループ「${payload.name}」が作成されました`,
    });
    emit("success");
    emit("close");
  } else {
    addToast({
      type: "error",
      message: "作成に失敗しました。",
      details: result.error?.message,
    });
  }
});
</script>
