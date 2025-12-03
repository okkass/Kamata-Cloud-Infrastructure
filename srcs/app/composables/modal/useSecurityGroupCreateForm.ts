/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * 修正点:
 * - useFieldArray の push メソッドの使用
 * - ルール追加時に一意な ID を生成して付与
 * - RuleTable に渡すデータを values (リアクティブなフォーム値) に統一
 * =================================================================================
 */
import { computed, toRef } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// 型定義のインポート (ファイルパスは環境に合わせてください)

// ==============================================================================
// 1. 定数・型定義
// ==============================================================================\

export const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp", "any"] as const;
export const ACTION_OPTIONS = ["allow", "deny"] as const;

// フォーム内のルールの型
interface RuleFormValues {
  id: string; // UIリスト操作(v-for key)用の一意なID
  name: string;
  protocol: (typeof PROTOCOL_OPTIONS)[number];
  port: number | null;
  targetIp: string;
  action: (typeof ACTION_OPTIONS)[number];
  ruleType: "inbound" | "outbound";
}

// フォーム全体の型
interface FormValues {
  name: string;
  description: string;
  inboundRules: RuleFormValues[];
  outboundRules: RuleFormValues[];
}

// ==============================================================================
// 2. Validation Schema (Zod)
// ==============================================================================\

const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.enum(PROTOCOL_OPTIONS),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z
      .number({ message: "数値を入力してください。" }) // ← message に統一
      .int("整数で入力")
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

// ==============================================================================
// 3. Main Composable
// ==============================================================================\

export function useSecurityGroupForm() {
  const { addToast } = useToast();
  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequest,
    SecurityGroupResponse
  >("security-groups");

  // --- フォーム初期化 ---
  const { errors, handleSubmit, defineField, values } = useForm<FormValues>({
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

  // --- ルール配列 (useFieldArray) ---
  const { push: pushInbound, remove: removeInbound } =
    useFieldArray<RuleFormValues>("inboundRules");

  const { push: pushOutbound, remove: removeOutbound } =
    useFieldArray<RuleFormValues>("outboundRules");

  // --- ヘルパー: 新規ルール生成 ---
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

  // --- 送信処理 ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      // APIリクエスト形式に変換
      // (UI用の id プロパティなどを除外して整形)
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
    // ★★★ 修正箇所: computed を toRef に変更 ★★★
    // これにより、RuleTable側での v-model による書き換えが可能になります。
    inboundRules: toRef(values, "inboundRules"),
    outboundRules: toRef(values, "outboundRules"),

    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isCreating,
    onFormSubmit,
  };
}
