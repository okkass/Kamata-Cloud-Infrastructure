/**
 * =================================================================================
 * 利用者追加フォーム Composable (useUserAddForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoUserAddコンポーネントで使用される
 * フォームの状態管理、バリデーション、API送信ロジックをカプセル化します。
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
// 共有型定義ファイルから型をインポート
import type { UserCreateRequestDTO, UserDTO } from "~/shared/types/users";

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  // preprocessで空文字をnullに変換します
  maxCpuCores: z.preprocess(
    (val) => (val === "" ? null : Number(val)), // 数値に変換
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
  maxMemorySizeInMb: z.preprocess(
    (val) => (val === "" ? null : Number(val)), // 数値に変換
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
  maxStorageSizeInGb: z.preprocess(
    (val) => (val === "" ? null : Number(val)), // 数値に変換
    z
      .number()
      .int("整数で入力してください")
      .min(1, "1以上の値を入力してください")
      .nullable()
  ),
});

const validationSchema = toTypedSchema(zodSchema);
// Zodスキーマからフォームの型を推論します
type FormValues = z.infer<typeof zodSchema>;

/**
 * メインのComposable関数
 */
export function useUserAddForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "",
      email: "",
      password: "",
      maxCpuCores: null, // 無制限の場合はnull
      maxMemorySizeInMb: null,
      maxStorageSizeInGb: null,
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  const [email, emailAttrs] = defineField("email");
  const [password, passwordAttrs] = defineField("password");
  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ============================================================================
  const { executeCreate: executeUserCreation, isCreating } = useResourceCreate<
    UserCreateRequestDTO,
    UserDTO
  >("users");
  const { addToast } = useToast();

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // APIに送信するデータ（ペイロード）を構築します
      const payload: UserCreateRequestDTO = {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        useTOTP: false, // このフォームではTOTPは使用しない想定
        isAdmin: false, // このフォームでは管理者権限は付与しない想定
        maxCpuCore: formValues.maxCpuCores, // フォームの `maxCpuCores` をAPIの `maxCpuCore` にマッピング
        // メモリサイズを MB から Byte に変換します
        maxMemorySize: formValues.maxMemorySizeInMb
          ? formValues.maxMemorySizeInMb * 1024 * 1024 // MB to Bytes
          : null, // 入力がない場合は null (無制限)
        // ストレージサイズを GB から Byte に変換します
        maxStorageSize: formValues.maxStorageSizeInGb
          ? formValues.maxStorageSizeInGb * 1024 * 1024 * 1024 // GB to Bytes
          : null, // 入力がない場合は null (無制限)
      };

      // APIリクエストを実行します
      const result = await executeUserCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        addToast({
          message: `利用者「${result.data?.name}」を追加しました。`,
          type: "success",
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          message: "ユーザーの作成に失敗しました。",
          type: "error",
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
    email,
    emailAttrs,
    password,
    passwordAttrs,
    maxCpuCores,
    maxCpuCoresAttrs,
    maxMemorySizeInMb, // UIはMB単位
    maxMemorySizeInMbAttrs,
    maxStorageSizeInGb, // UIはGB単位
    maxStorageSizeInGbAttrs,
    isCreating, // API通信中のローディング状態
    onFormSubmit, // フォーム送信ハンドラ
  };
}
