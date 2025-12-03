/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupCreateForm.ts)
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

export const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp", "any"] as const;
export const ACTION_OPTIONS = ["allow", "deny"] as const;

interface RuleFormValues {
  id: string;
  name: string;
  protocol: (typeof PROTOCOL_OPTIONS)[number];
  port: number | null;
  targetIp: string;
  action: (typeof ACTION_OPTIONS)[number];
  ruleType: "inbound" | "outbound";
}

interface FormValues {
  name: string;
  description: string;
  inboundRules: RuleFormValues[];
  outboundRules: RuleFormValues[];
}

// Zod Schema
const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.enum(PROTOCOL_OPTIONS),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z
      .number({ message: "数値を入力してください。" })
      .int("整数で入力してください")
      .min(0)
      .max(65535)
      .nullable()
      .optional()
  ),
  targetIp: z.string().min(1, "対象IPは必須です。"),
  action: z.enum(ACTION_OPTIONS),
  ruleType: z.enum(["inbound", "outbound"]),
});

const zodSchema = z.object({
  name: z.string().min(1, "グループ名は必須です。"),
  description: z.string().optional(),
  inboundRules: z.array(ruleSchema),
  outboundRules: z.array(ruleSchema),
});

const validationSchema = toTypedSchema(zodSchema);

export function useSecurityGroupForm() {
  const { addToast } = useToast();
  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequest,
    SecurityGroupResponse
  >("security-groups");

  const { errors, handleSubmit, defineField } = useForm<FormValues>({
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

  // ★★★ 修正: useFieldArray を使用 ★★★
  // fields はリアクティブな配列であり、各要素は書き込み可能です（{value: ...}形式）
  const {
    fields: inboundRules,
    push: pushInbound,
    remove: removeInbound,
  } = useFieldArray<RuleFormValues>("inboundRules");

  const {
    fields: outboundRules,
    push: pushOutbound,
    remove: removeOutbound,
  } = useFieldArray<RuleFormValues>("outboundRules");

  const createEmptyRule = (type: "inbound" | "outbound"): RuleFormValues => ({
    id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: "",
    protocol: "tcp",
    port: null,
    targetIp: "0.0.0.0/0",
    action: "allow",
    ruleType: type,
  });

  const addInboundRule = () => pushInbound(createEmptyRule("inbound"));
  const removeInboundRule = (idx: number) => removeInbound(idx);
  const addOutboundRule = () => pushOutbound(createEmptyRule("outbound"));
  const removeOutboundRule = (idx: number) => removeOutbound(idx);

  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      const mapRule = (r: RuleFormValues) => ({
        name: r.name,
        ruleType: r.ruleType,
        protocol: r.protocol,
        port: r.port,
        targetIp: r.targetIp,
        action: r.action,
      });

      const payload: SecurityGroupCreateRequest = {
        name: formValues.name,
        description: formValues.description,
        rules: [
          ...formValues.inboundRules.map(mapRule),
          ...formValues.outboundRules.map(mapRule),
        ],
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          type: "success",
          message: `セキュリティグループ「${payload.name}」を作成しました。`,
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
  };

  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    // useFieldArray の戻り値 (fields) をそのまま返す
    inboundRules,
    outboundRules,
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isCreating,
    onFormSubmit,
  };
}
