/**
 * =================================================================================
 * 仮想ネットワーク作成フォーム Composable (useVirtualNetworkCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoVirtualNetworkCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、API送信ロジックをカプセル化します。
 * 型定義はバックエンド側で行う前提のため、ここでは定義しません。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate"; // パスはプロジェクト構成に合わせて調整
import { useToast } from "~/composables/useToast"; // パスはプロジェクト構成に合わせて調整

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  // nameは1文字以上の文字列であることが必須です。
  name: z.string().min(1, "ネットワーク名は必須です。"),
  // cidrはCIDR形式に一致する文字列であることが必須です。
  cidr: z
    .string()
    .min(1, "CIDRは必須です。")
    .regex(
      /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/,
      "有効なCIDR形式で入力してください (例: 192.168.0.0/16)。"
    ),
});

const validationSchema = toTypedSchema(zodSchema);
// Zodスキーマからフォームの型を推論します (TypeScriptを使用している場合)
type FormValues = z.infer<typeof zodSchema>;

/**
 * メインのComposable関数
 */
export function useVirtualNetworkCreateForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "",
      cidr: "",
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  const [cidr, cidrAttrs] = defineField("cidr");

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // DTOの型はanyを使用します (バックエンドで型定義する前提のため)
  // ============================================================================
  const { executeCreate: executeVirtualNetworkCreation, isCreating } =
    useResourceCreate<any, any>( // 型定義はanyを使用
      "virtual-networks" // APIエンドポイントのパス
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
      // このフォームでは、フォームの値がそのままペイロードになります
      const payload = formValues; // 型はz.infer<typeof zodSchema> から推論

      // APIリクエストを実行します
      const result = await executeVirtualNetworkCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        addToast({
          type: "success",
          message: `仮想ネットワーク「${payload.name}」が作成されました`,
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          type: "error",
          message: "仮想ネットワークの作成に失敗しました。",
          details: result.error?.message, // エラー詳細を表示
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
    cidr,
    cidrAttrs,
    isCreating, // API通信中のローディング状態
    onFormSubmit, // フォーム送信ハンドラ
  };
}
