import { useForm, useFieldArray, type FieldEntry } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// 1. 定数・型定義
// ==============================================================================

// UIのセレクトボックス用定数 (編集画面と共通化するためにexport)
export const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp", "any"] as const;
export const ACTION_OPTIONS = ["allow", "deny"] as const;

// フォーム内のルールの型 (UI操作用に id を持たせる)
interface RuleFormValues {
  id: string; // VeeValidateの管理IDとは別に、UIリスト操作(v-for key)用に持つ
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
  id: z.string(), // バリデーション自体は不要だがオブジェクトに含まれるため定義
  name: z.string().min(1, "必須"),
  // 大文字小文字の揺らぎを許容する場合の例
  protocol: z.enum([...PROTOCOL_OPTIONS, "TCP", "UDP", "ICMP", "Any"]),
  port: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number({ message: "数値のみ" }).min(0).max(65535).nullable()
  ),
  targetIp: z.string().min(1, "必須"),
  action: z.enum(ACTION_OPTIONS),
  ruleType: z.enum(["inbound", "outbound"]),
});

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "必須"),
    description: z.string().optional(),
    inboundRules: z.array(ruleSchema),
    outboundRules: z.array(ruleSchema),
  })
);

// ==============================================================================
// 3. Composable Logic
// ==============================================================================

export function useSecurityGroupForm() {
  const { addToast } = useToast();

  // リソース名はプロジェクトの定数などに合わせてください
  const { executeCreate, isCreating } = useResourceCreate<
    SecurityGroupCreateRequest,
    SecurityGroupResponse
  >("security-groups");

  // --- Form Setup ---
  const { errors, handleSubmit, defineField, values } = useForm<FormValues>({
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

  // useFieldArray に型引数を渡すことで、fields.value が正しく型付けされます
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

  // --- Helper Methods ---

  // 新規ルール作成のファクトリ関数 (編集画面と同じロジック)
  const createNewRule = (type: "inbound" | "outbound"): RuleFormValues => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    protocol: "tcp",
    port: null,
    targetIp: "0.0.0.0/0",
    action: "allow",
    ruleType: type,
  });

  const addInboundRule = () => pushInbound(createNewRule("inbound"));
  const addOutboundRule = () => pushOutbound(createNewRule("outbound"));

  // IDを受け取って削除する (RuleTableからのイベント対応)
  // fields は useFieldArray の戻り値そのものを渡す
  const removeRuleById = (
    fields: FieldEntry<RuleFormValues>[],
    removeFn: (idx: number) => void,
    id: string
  ) => {
    const index = fields.findIndex((r) => r.value.id === id);
    if (index !== -1) {
      removeFn(index);
    }
  };

  const removeInboundRule = (id: string) =>
    removeRuleById(inboundRuleFields.value, removeInbound, id);

  const removeOutboundRule = (id: string) =>
    removeRuleById(outboundRuleFields.value, removeOutbound, id);

  // --- Submission Handler ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (values) => {
      // フォームの値をAPIのリクエスト形式(DTO)に変換
      const mapRuleToDto = (r: RuleFormValues) => ({
        name: r.name,
        ruleType: r.ruleType,
        // APIが小文字のみ受け付ける場合、ここで統一する
        protocol: r.protocol.toLowerCase() as (typeof PROTOCOL_OPTIONS)[number],
        port: r.port,
        targetIp: r.targetIp,
        action: r.action,
      });

      const payload: SecurityGroupCreateRequest = {
        name: values.name,
        description: values.description || undefined,
        rules: [
          ...values.inboundRules.map(mapRuleToDto),
          ...values.outboundRules.map(mapRuleToDto),
        ],
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
    // State & Handlers
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,

    inboundRules: computed(() => values.inboundRules),
    outboundRules: computed(() => values.outboundRules),

    inboundRuleFields,
    outboundRuleFields,
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isCreating,
    onFormSubmit,

    // Options (UI用)
    protocolOptions: PROTOCOL_OPTIONS,
    actionOptions: ACTION_OPTIONS,
  };
}
