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
import { useResourceCreate } from "~/composables/useResourceCreate"; // パスはプロジェクト構成に合わせて調整
import { useToast } from "~/composables/useToast"; // パスはプロジェクト構成に合わせて調整

// ==============================================================================
// Type Definitions (型定義)
// APIとの通信で使用するデータの型を定義します。
// ==============================================================================
// POST /api/users で送信するリクエストボディの型
interface UserCreateRequestDTO {
  name: string;
  email: string;
  password: string;
  useTOTP: boolean;
  isAdmin: boolean;
  maxCpuCore: number | null;
  maxMemorySize: number | null; // バイト単位
  maxStorageSize: number | null; // バイト単位
}
// POST成功後に返される、作成済みユーザーの型
interface UserDTO {
  id: string;
  name: string;
  // ... 他のプロパティ
}

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "アカウント名は必須です。"),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  // preprocessを使って、入力が空文字の場合にバリデーション前にnullに変換します
  maxCpuCores: z.preprocess(
    (val) => (val === "" ? null : val),
    z.number().int("整数で入力").min(1, "1以上の値を入力").nullable()
  ),
  maxMemorySizeInMb: z.preprocess(
    (val) => (val === "" ? null : val),
    z.number().int("整数で入力").min(1, "1以上の値を入力").nullable()
  ),
  maxStorageSizeInGb: z.preprocess(
    (val) => (val === "" ? null : val),
    z.number().int("整数で入力").min(1, "1以上の値を入力").nullable()
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
  // フォームのフィールド名はAPIと異なっていてもOK (後で送信時にマッピングするため)
  const [maxCpuCores, maxCpuCoresAttrs] = defineField("maxCpuCores");
  const [maxMemorySizeInMb, maxMemorySizeInMbAttrs] =
    defineField("maxMemorySizeInMb");
  const [maxStorageSizeInGb, maxStorageSizeInGbAttrs] =
    defineField("maxStorageSizeInGb");

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ============================================================================
  const { executeCreate, isCreating } = useResourceCreate<
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
    handleSubmit(async (values) => {
      // APIに送信するデータ（ペイロード）を構築します
      const payload: UserCreateRequestDTO = {
        name: values.name,
        email: values.email,
        password: values.password,
        useTOTP: false, // このフォームではTOTPは使用しない想定
        isAdmin: false, // このフォームでは管理者権限は付与しない想定
        maxCpuCore: values.maxCpuCores, // フォームの値 `maxCpuCores` をAPIの `maxCpuCore` にマッピング
        // メモリサイズを MB から Byte に変換します
        maxMemorySize: values.maxMemorySizeInMb
          ? values.maxMemorySizeInMb * 1024 * 1024 // MB to Bytes
          : null, // 入力がない場合は null (無制限)
        // ストレージサイズを GB から Byte に変換します
        maxStorageSize: values.maxStorageSizeInGb
          ? values.maxStorageSizeInGb * 1024 * 1024 * 1024 // GB to Bytes
          : null, // 入力がない場合は null (無制限)
      };

      // APIリクエストを実行します
      const result = await executeCreate(payload);

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
    maxMemorySizeInMb,
    maxMemorySizeInMbAttrs,
    maxStorageSizeInGb,
    maxStorageSizeInGbAttrs,
    isCreating, // API通信中のローディング状態
    onFormSubmit, // フォーム送信ハンドラ
  };
}
