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
// ==============================================================================
interface SecurityGroupRuleForRequest {
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

/**
 * 文字列が有効なIPv4アドレスであるかをチェックするヘルパー関数
 * @param ip - チェックする文字列
 */
const isIPv4 = (ip: string): boolean => {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

// --- ルール一行分のスキーマ ---
const ruleSchema = z.object({
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
  // --- 送信元IPのバリデーションを .refine() を使ったカスタム方式に変更 ---
  targetIp: z
    .string()
    .min(1, "入力必須")
    .refine(
      (value) => {
        const [ip, mask] = value.split("/");
        // 1. IPアドレス部分が有効かチェック
        if (!isIPv4(ip)) {
          return false;
        }
        // 2. マスク部分が存在する場合、有効かチェック
        if (mask !== undefined) {
          const maskNumber = Number(mask);
          if (
            isNaN(maskNumber) ||
            maskNumber < 0 ||
            maskNumber > 32 ||
            !Number.isInteger(maskNumber)
          ) {
            return false;
          }
        }
        // すべてのチェックを通過
        return true;
      },
      {
        message: "有効なIPアドレスまたはCIDR形式で入力してください。",
      }
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
  push: addInboundRule,
  remove: removeInboundRule,
} = useFieldArray("inboundRules");
const {
  fields: outboundRuleFields,
  push: addOutboundRule,
  remove: removeOutboundRule,
} = useFieldArray("outboundRules");

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
  const payload: SecurityGroupCreateRequestDTO = {
    name: formValues.name,
    description: formValues.description,
    rules: [
      ...formValues.inboundRules.map((rule) => ({
        ...rule,
        ruleType: "inbound" as const,
        protocol: rule.protocol.toLowerCase() as "tcp" | "udp" | "icmp",
        action: "allow" as const,
      })),
      ...formValues.outboundRules.map((rule) => ({
        ...rule,
        ruleType: "outbound" as const,
        protocol: rule.protocol.toLowerCase() as "tcp" | "udp" | "icmp",
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
