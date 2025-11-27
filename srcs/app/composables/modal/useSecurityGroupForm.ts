/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupForm.ts)
 * =================================================================================
 */
import { computed } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

import type { SecurityGroupCreateRequestDTO } from "~~/shared/types/dto/security-group/SecurityGroupCreateRequestDTO";
import type { SecurityGroupDTO } from "~~/shared/types/dto/security-group/SecurityGroupDTO";
import type { SecurityRuleCreateRequestDTO } from "~~/shared/types/dto/security-group/SecurityRuleCreateRequestDTO";
import {
  SecurityRuleProtocolEnum,
  SecurityRuleActionEnum,
  SecurityRuleRuleTypeEnum,
} from "~~/shared/types/dto/security-group/SecurityRuleDTO";

// ==============================================================================
// Validation Schema
// ==============================================================================

// 個別のルールのスキーマ
const ruleSchema = z.object({
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.enum(["tcp", "udp", "icmp", "any", "TCP", "UDP", "ICMP", "Any"]),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z
      .number({ message: "数値を入力してください。" })
      .int("整数で入力してください。")
      .min(0)
      .max(65535)
      .nullable()
  ),
  targetIp: z.cidrv4("有効なCIDR形式で入力してください。"),
});

// ルールの型定義を抽出する
type RuleFormValues = z.infer<typeof ruleSchema>;

// フォーム全体のスキーマ
const zodSchema = z.object({
  name: z.string().min(1, "セキュリティグループ名は必須です。"),
  description: z.string().optional(),
  inboundRules: z.array(ruleSchema),
  outboundRules: z.array(ruleSchema),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * セキュリティグループ作成フォームのロジック
 */
export function useSecurityGroupForm() {
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequestDTO,
    SecurityGroupDTO
  >("security-groups");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, defineField } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
      inboundRules: [],
      outboundRules: [],
    },
  });

  // --- 基本フィールド ---
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

  // --- ルール配列 ---
  const {
    fields: inboundRuleFields,
    push: pushInbound,
    remove: removeInbound,
  } = useFieldArray<RuleFormValues>("inboundRules");

  const {
    fields: outboundRuleFields,
    push: pushOutbound,
    remove: removeOutbound,
  } = useFieldArray<RuleFormValues>("outboundRules");

  // ============================================================================
  // Helper Methods
  // ============================================================================

  const normalizeProtocol = (proto: string): SecurityRuleProtocolEnum => {
    const lower = proto.toLowerCase();
    if (lower === "tcp") return SecurityRuleProtocolEnum.Tcp;
    if (lower === "udp") return SecurityRuleProtocolEnum.Udp;
    if (lower === "icmp") return SecurityRuleProtocolEnum.Icmp;
    return SecurityRuleProtocolEnum.Any;
  };

  // 戻り値の型を RuleFormValues に明示する
  // これにより、protocol: "TCP" が string ではなく "TCP" 型として扱われます
  const createEmptyRule = (): RuleFormValues => ({
    name: "",
    protocol: "TCP",
    port: null,
    targetIp: "0.0.0.0/0",
  });

  const addInboundRule = () => pushInbound(createEmptyRule());
  const removeInboundRule = (idx: number) => removeInbound(idx);

  const addOutboundRule = () => pushOutbound(createEmptyRule());
  const removeOutboundRule = (idx: number) => removeOutbound(idx);

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (values) => {
      const inboundDTOs: SecurityRuleCreateRequestDTO[] =
        values.inboundRules.map((rule) => ({
          name: rule.name,
          ruleType: SecurityRuleRuleTypeEnum.Inbound,
          protocol: normalizeProtocol(rule.protocol),
          port: rule.port,
          targetIp: rule.targetIp,
          action: SecurityRuleActionEnum.Allow,
        }));

      const outboundDTOs: SecurityRuleCreateRequestDTO[] =
        values.outboundRules.map((rule) => ({
          name: rule.name,
          ruleType: SecurityRuleRuleTypeEnum.Outbound,
          protocol: normalizeProtocol(rule.protocol),
          port: rule.port,
          targetIp: rule.targetIp,
          action: SecurityRuleActionEnum.Allow,
        }));

      const payload: SecurityGroupCreateRequestDTO = {
        name: values.name,
        description: values.description || undefined,
        rules: [...inboundDTOs, ...outboundDTOs],
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          message: `セキュリティグループ「${payload.name}」を作成しました。`,
          type: "success",
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          message: "作成に失敗しました。",
          type: "error",
          details: result.error?.message,
        });
      }
    });
  };

  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    inboundRuleFields,
    outboundRuleFields,
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isCreating,
    onFormSubmit,
  };
}
