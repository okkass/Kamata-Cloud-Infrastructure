/**
 * =================================================================================
 * セキュリティグループ作成フォーム Composable (useSecurityGroupForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoSecurityGroupCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、API送信ロジックをカプセル化します。
 * APIの型定義は `~/shared/types` ディレクトリからインポートします。
 * =================================================================================
 */
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
// ★ 共有型定義ファイルから型をインポート (ファイル名は想定)
import type {
  SecurityGroupCreateRequestDTO,
  SecurityGroupDTO,
} from "~~/shared/types";

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const ruleSchema = z
  .object({
    name: z.string().min(1, "ルール名は必須です。"),
    protocol: z.enum(["TCP", "UDP", "ICMP", "Any"]),
    port: z.preprocess(
      (val) => (val === "" || val === null ? null : Number(val)),
      z
        .number({ message: "数値を入力してください。" }) // エラーメッセージを追加
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
  // ポート番号のカスタムバリデーション
  .refine(
    (data) => {
      // プロトコルが 'Any' または 'ICMP' の場合、ポートは空（null）でなければならない
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
      path: ["port"], // エラーメッセージを表示するフィールド
    }
  );

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "セキュリティグループ名は必須です。"),
    description: z.string().optional(), // 説明は任意項目
    inboundRules: z.array(ruleSchema), // ルールは配列
    outboundRules: z.array(ruleSchema),
  })
);

/**
 * メインのComposable関数
 */
export function useSecurityGroupForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "",
      description: "",
      inboundRules: [],
      outboundRules: [
        // アウトバウンドにデフォルトルールを設定
        {
          name: "allow-all",
          protocol: "Any",
          port: null,
          targetIp: "0.0.0.0/0",
        },
      ],
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

  // useFieldArrayで動的なルールリストを管理します
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

  // ルール追加ボタンのデフォルト値
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
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ★ インポートした型を使用
  // ============================================================================
  const { executeCreate: executeSecurityGroupCreation, isCreating } =
    useResourceCreate<SecurityGroupCreateRequestDTO, SecurityGroupDTO>(
      "security-groups" // APIエンドポイント '/api/security-groups' に対応
    );
  const { addToast } = useToast();

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // APIに送信するデータ（ペイロード）を構築します
      const payload: SecurityGroupCreateRequestDTO = {
        name: formValues.name,
        description: formValues.description || undefined, // 空文字ならundefined
        rules: [
          // インバウンドルールをAPI形式に変換
          ...formValues.inboundRules.map((rule) => ({
            name: rule.name,
            ruleType: "inbound" as const, // ルールタイプを追加
            protocol: rule.protocol.toLowerCase() as any, // プロトコルを小文字に ('Any' -> 'any')
            port: rule.port,
            targetIp: rule.targetIp,
            action: "allow" as const, // アクションは 'allow' 固定
          })),
          // アウトバウンドルールをAPI形式に変換
          ...formValues.outboundRules.map((rule) => ({
            name: rule.name,
            ruleType: "outbound" as const, // ルールタイプを追加
            protocol: rule.protocol.toLowerCase() as any, // プロトコルを小文字に ('Any' -> 'any')
            port: rule.port,
            targetIp: rule.targetIp,
            action: "allow" as const, // アクションは 'allow' 固定
          })),
        ],
      };

      // APIリクエストを実行します
      const result = await executeSecurityGroupCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        addToast({
          type: "success",
          message: `セキュリティグループ「${payload.name}」が作成されました`,
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          type: "error",
          message: "作成に失敗しました。",
          details: result.error?.message, // APIからのエラー詳細を表示
        });
      }
    });

  // ============================================================================
  // Expose (外部への公開)
  // コンポーネント側で利用するリアクティブな状態や関数を返却します。
  // ============================================================================
  return {
    errors, // バリデーションエラーオブジェクト
    // 各フォームフィールドの値と属性 (v-model, v-bind用)
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    inboundRuleFields, // インバウンドルールの配列 (useFieldArray)
    outboundRuleFields, // アウトバウンドルールの配列 (useFieldArray)
    // ルール追加・削除関数
    addInboundRule,
    removeInboundRule,
    addOutboundRule,
    removeOutboundRule,
    isCreating, // API通信中のローディング状態
    onFormSubmit, // フォーム送信ハンドラ (バリデーション実行 + API送信)
  };
}
