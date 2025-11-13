/**
 * =================================================================================
 * セキュリティグループ編集フォーム Composable (useSecurityGroupEditForm.ts)
 * ---------------------------------------------------------------------------------
 * MoSecurityGroupEdit コンポーネントのフォーム状態管理、バリデーション、
 * データ変換、および API 送信ロジックを担当します。
 * ★ 新しいAPI仕様 に対応
 * =================================================================================
 */
import { ref, watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useToast } from "~/composables/useToast";
import { useResourceUpdate } from "~/composables/useResourceEdit";
// ★ 新しい型定義をインポート
import {
  type SecurityGroupDTO,
  type SecurityRuleDTO,
  type SecurityGroupUpdateRequestDTO,
  SecurityRuleProtocolEnum,
  SecurityRuleActionEnum,
} from "~~/shared/types/security-groups";

// --- Props の型定義 ---
interface SecurityGroupEditProps {
  show: boolean;
  securityGroupData: SecurityGroupDTO | null;
}

// --- バリデーションスキーマ ---
// ★ API仕様 に合わせたフォーム内のルールスキーマ
const formRuleSchema = z.object({
  id: z.string().nullable(), // 既存ルールのID (新規は null)
  name: z.string().min(1, "ルール名は必須です。"),
  protocol: z.nativeEnum(SecurityRuleProtocolEnum, {
    errorMap: () => ({ message: "プロトコルは必須です。" }),
  }),
  port: z
    .number({ invalid_type_error: "ポート番号を入力してください。" })
    .int()
    .positive()
    .nullable(),
  targetIp: z.string().min(1, "ターゲットIPは必須です。"),
  action: z.nativeEnum(SecurityRuleActionEnum, {
    errorMap: () => ({ message: "アクションは必須です。" }),
  }),
});
type FormRule = z.infer<typeof formRuleSchema>;

// フォーム全体のスキーマ
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "グループ名は必須です。"),
    description: z.string().nullable(),
    inboundRules: z.array(formRuleSchema),
    outboundRules: z.array(formRuleSchema),
  })
);

/**
 * セキュリティグループ編集フォームのロジック
 * @param props MoSecurityGroupEdit から渡される props
 */
export function useSecurityGroupEditForm(props: SecurityGroupEditProps) {
  const { addToast } = useToast();

  // ★ 汎用の更新Composableをセットアップ
  const { executeUpdate, isUpdating } = useResourceUpdate<
    SecurityGroupUpdateRequestDTO,
    SecurityGroupDTO
  >("security-groups"); // APIパス

  // --- VeeValidate のセットアップ ---
  const { errors, defineField, handleSubmit, resetForm, values } = useForm({
    validationSchema,
    initialValues: {
      name: "",
      description: null as string | null,
      inboundRules: [] as FormRule[],
      outboundRules: [] as FormRule[],
    },
  });

  // --- フォームフィールドの定義 ---
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

  // --- 動的配列 (Rules) ---
  const {
    fields: inboundFields,
    push: pushInbound,
    remove: removeInbound,
  } = useFieldArray<FormRule>("inboundRules");

  const {
    fields: outboundFields,
    push: pushOutbound,
    remove: removeOutbound,
  } = useFieldArray<FormRule>("outboundRules");

  // --- 初期値の設定 (APIデータ -> フォームデータ) ---
  watch(
    () => props.securityGroupData,
    (newData) => {
      if (props.show && newData) {
        // API (SecurityRuleDTO) -> フォーム (FormRule) に変換
        const mapApiRuleToForm = (rule: SecurityRuleDTO): FormRule => ({
          id: rule.id,
          name: rule.name,
          protocol: rule.protocol,
          port: rule.port, // API (number | null) -> フォーム (number | null)
          targetIp: rule.targetIp,
          action: rule.action,
        });

        const formValues = {
          name: newData.name,
          description: newData.description || null,
          inboundRules: (newData.rules || [])
            .filter((rule) => rule.ruleType === "inbound")
            .map(mapApiRuleToForm),
          outboundRules: (newData.rules || [])
            .filter((rule) => rule.ruleType === "outbound")
            .map(mapApiRuleToForm),
        };
        resetForm({ values: formValues });
      }
    },
    { immediate: true, deep: true }
  );

  // --- UI操作 (ルール追加) ---
  const addInboundRule = () => {
    pushInbound({
      id: null,
      name: "New Inbound Rule",
      protocol: SecurityRuleProtocolEnum.Tcp,
      port: null,
      targetIp: "0.0.0.0/0",
      action: SecurityRuleActionEnum.Allow,
    });
  };
  const addOutboundRule = () => {
    pushOutbound({
      id: null,
      name: "New Outbound Rule",
      protocol: SecurityRuleProtocolEnum.Any,
      port: null,
      targetIp: "0.0.0.0/0",
      action: SecurityRuleActionEnum.Allow,
    });
  };

  // --- フォーム送信処理 (フォームデータ -> APIデータ) ---
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      if (!props.securityGroupData) {
        addToast({
          type: "error",
          message: "編集対象のグループが見つかりません。",
        });
        return;
      }

      // フォーム (FormRule) -> API (SecurityRuleUpdateDTO) に変換
      const mapFormRuleToApi = (
        rule: FormRule,
        ruleType: "inbound" | "outbound"
      ): SecurityRuleUpdateDTO => ({
        id: rule.id || undefined, // 新規ルールの場合は id を含めない
        name: rule.name,
        ruleType: ruleType,
        protocol: rule.protocol,
        port: rule.port, // フォーム (number | null) -> API (number | null)
        targetIp: rule.targetIp,
        action: rule.action,
      });

      // 1. API (PUT) リクエストボディを作成
      const payload: SecurityGroupUpdateRequestDTO = {
        name: formValues.name,
        description: formValues.description || undefined,
        rules: [
          ...formValues.inboundRules.map((rule) =>
            mapFormRuleToApi(rule, "inbound")
          ),
          ...formValues.outboundRules.map((rule) =>
            mapFormRuleToApi(rule, "outbound")
          ),
        ],
      };

      // 2. 汎用Composableの executeUpdate を呼び出す
      const { success, error } = await executeUpdate(
        props.securityGroupData.id,
        payload
      );

      // 3. 結果をハンドリング
      if (success) {
        addToast({
          type: "success",
          message: `「${values.name}」を更新しました。`,
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          type: "error",
          message: "セキュリティグループの更新に失敗しました。",
          details: error?.message || "不明なエラーです。",
        });
      }
    });
  };

  // --- 公開 (MoSecurityGroupEdit.vue が使用) ---
  return {
    errors,
    values, // RuleTable がエラー参照で使うため
    // フォームフィールド
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    // 動的配列
    inboundFields,
    outboundFields,
    removeInbound,
    removeOutbound,
    addInboundRule,
    addOutboundRule,
    // 状態とアクション
    isUpdating,
    onFormSubmit,
    // ★ FormSelect の options で使用
    protocolOptions: Object.values(SecurityRuleProtocolEnum),
    actionOptions: Object.values(SecurityRuleActionEnum),
  };
}
