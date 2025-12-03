/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupCreateForm.ts)
 * =================================================================================
 */
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// 1. 定数・型定義
// ==============================================================================

export const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp", "any"] as const;
export const ACTION_OPTIONS = ["allow", "deny"] as const;

// フォーム内のルールの型
interface RuleFormValues {
  id: string;
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
// ==============================================================================

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

// ==============================================================================
// 3. Main Composable
// ==============================================================================

export function useSecurityGroupForm() {
  const { addToast } = useToast();
  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequest,
    SecurityGroupResponse
  >("security-groups");

  // --- フォーム初期化 ---
  // setFieldValue を取得して手動同期に使用します
  const { errors, handleSubmit, defineField, setFieldValue } =
    useForm<FormValues>({
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

  // --- ルール配列 (ローカル管理) ---
  // ここを ref で定義することで、確実に書き込み可能(Mutable)にします
  const inboundRules = ref<RuleFormValues[]>([]);
  const outboundRules = ref<RuleFormValues[]>([]);

  // --- 同期処理 (Local -> VeeValidate) ---
  // ローカルの変更を監視し、VeeValidate のフォーム値に反映させます
  watch(
    inboundRules,
    (newVal) => {
      setFieldValue("inboundRules", newVal);
    },
    { deep: true }
  );

  watch(
    outboundRules,
    (newVal) => {
      setFieldValue("outboundRules", newVal);
    },
    { deep: true }
  );

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

  // --- 操作関数 ---
  // ローカルの ref を直接操作します
  const addInboundRule = () => {
    inboundRules.value.push(createEmptyRule("inbound"));
  };
  const removeInboundRule = (idx: number) => {
    inboundRules.value.splice(idx, 1);
  };

  const addOutboundRule = () => {
    outboundRules.value.push(createEmptyRule("outbound"));
  };
  const removeOutboundRule = (idx: number) => {
    outboundRules.value.splice(idx, 1);
  };

  // --- 送信処理 ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    // handleSubmit の引数 formValues には、同期された最新の値が入っています
    return handleSubmit(async (formValues) => {
      // APIリクエスト形式に変換
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

    // ref をそのまま返すので、Vue コンポーネント側で自由に書き換え可能です
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
