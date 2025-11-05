/**
 * =================================================================================
 * インスタンスタイプ追加フォーム Composable (useInstanceTypeAddForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoInstanceTypeAddコンポーネントで使用される
 * フォームの状態管理、バリデーション、API送信ロジックをカプセル化します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate"; 
import { useToast } from "~/composables/useToast"; 

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    cpuCores: z
      .number({
        required_error: "CPUコア数は必須です。",
        invalid_type_error: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySizeInMb: z
      .number({
        required_error: "メモリサイズは必須です。",
        invalid_type_error: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1MB以上の値を入力してください。"),
  })
);

/**
 * メインのComposable関数
 */
export function useInstanceTypeAddForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "", // 名前は空で初期化
      cpuCores: 1,
      memorySizeInMb: 1024,
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  const [cpuCores, cpuCoresAttrs] = defineField("cpuCores");
  const [memorySizeInMb, memorySizeInMbAttrs] = defineField("memorySizeInMb");

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ============================================================================
  const { executeCreate: executeInstanceTypeCreation, isCreating } =
    useResourceCreate<InstanceTypeCreateRequestDTO, ModelInstanceTypeDTO>(
      "instance-types" // APIエンドポイントのパス
    );
  const { addToast } = useToast();

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // APIに送信するデータ（ペイロード）を構築します。
      // メモリサイズはMBからByteに変換します。
      const payload: InstanceTypeCreateRequestDTO = {
        name: formValues.name,
        cpuCore: formValues.cpuCores,
        memorySize: formValues.memorySizeInMb * 1024 * 1024, // MB to Bytes
      };

      // APIリクエストを実行します。
      const result = await executeInstanceTypeCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します。
      if (result.success) {
        addToast({
          type: "success",
          message: `インスタンスタイプ「${payload.name}」が作成されました`,
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          type: "error",
          message: "作成に失敗しました。",
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
    cpuCores,
    cpuCoresAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    isCreating, // API通信中のローディング状態
    onFormSubmit, // フォーム送信ハンドラ
  };
}
