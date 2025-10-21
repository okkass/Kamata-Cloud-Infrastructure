/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoSecurityGroupCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、API送信ロジックをカプセル化します。
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// Validation Schema
// ==============================================================================
const ruleSchema = z
  .object({
    name: z.string().min(1, "ルール名は必須です。"),
    protocol: z.enum(["TCP", "UDP", "ICMP", "Any"]),
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
  })
  .refine(
    (data) => {
      if (
        (data.protocol === "Any" || data.protocol === "ICMP") &&
        data.port !== null
      ) {
        return false;
      }
      return true;
    },
    {
      message: "このプロトコルではポートは指定できません。",
      path: ["port"],
    }
  );

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "セキュリティグループ名は必須です。"),
    description: z.string().optional(),
    inboundRules: z.array(ruleSchema),
    outboundRules: z.array(ruleSchema),
  })
);

/**
 * メインのComposable関数
 */
export function useSecurityGroupForm() {
  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
      inboundRules: [],
      outboundRules: [
        {
          name: "allow-all",
          protocol: "Any",
          port: null,
          targetIp: "0.0.0.0/0",
        },
      ],
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

  const addInboundRule = () => {
    pushInbound({
      name: "",
      protocol: "TCP",
      port: null,
      targetIp: "0.0.0.0/0",
    });
  };
  const addOutboundRule = () => {
    pushOutbound({
      name: "",
      protocol: "TCP",
      port: null,
      targetIp: "0.0.0.0/0",
    });
  };

  // ============================================================================
  // API Submission
  // ============================================================================
  const { executeCreate: executeSecurityGroupCreation, isCreating } =
    useResourceCreate<SecurityGroupCreateRequestDTO, SecurityGroupDTO>(
      "security-groups"
    );
  const { addToast } = useToast();

  /**
   * フォーム送信時の処理
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      const payload: SecurityGroupCreateRequestDTO = {
        name: formValues.name,
        description: formValues.description,
        rules: [
          ...formValues.inboundRules.map((rule) => ({
            name: rule.name,
            ruleType: "inbound" as const,
            protocol: rule.protocol.toLowerCase() as any,
            port: rule.port,
            targetIp: rule.targetIp,
            action: "allow" as const,
          })),
          ...formValues.outboundRules.map((rule) => ({
            name: rule.name,
            ruleType: "outbound" as const,
            protocol: rule.protocol.toLowerCase() as any,
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

  // ============================================================================
  // Expose
  // コンポーネント側で利用する変数や関数を返却
  // ============================================================================
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
