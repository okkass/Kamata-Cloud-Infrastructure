/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoImageAddコンポーネントで使用される
 * フォームの状態管理、バリデーション、ファイル処理、API送信ロジックをカプセル化します。
 * =================================================================================
 */
import { ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// フォームのバリデーションルールをZodで定義します。
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  // ファイルは必須。 Fileオブジェクトであることを確認します (vee-validate側でFile型を渡す前提)
  // 受け付けるファイル形式はコンポーネント側の accept 属性で制御します
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  // description は任意項目
  description: z.string().optional(),
});

const validationSchema = toTypedSchema(zodSchema);
// Zodスキーマからフォームの型を推論します
type FormValues = z.infer<typeof zodSchema>;

/**
 * ファイルをBase64文字列に変換するヘルパー関数
 * @param file 変換するFileオブジェクト
 * @returns Base64エンコードされた文字列のPromise
 */
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 結果 (DataURL) からプレフィックス (`data:*/*;base64,`) を除去してBase64部分のみを返します
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // ファイルをDataURLとして読み込みます
  });
};

/**
 * メインのComposable関数
 */
export function useImageAddForm() {
  // ============================================================================
  // Form Setup (フォーム設定)
  // VeeValidateのuseFormを使って、フォーム全体を管理します。
  // ============================================================================
  const { errors, defineField, handleSubmit } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      // フォームの初期値を設定します
      name: "",
      file: undefined, // ファイルは初期状態では未選択 (undefined)
      description: "",
    },
  });

  // 各フォームフィールドとVeeValidateを連携させます
  const [name, nameAttrs] = defineField("name");
  // FormDropZone コンポーネントは v-model で直接 file ref を更新するため、fileAttrs は通常不要
  const [file] = defineField("file");
  const [description, descriptionAttrs] = defineField("description");

  // ============================================================================
  // API Submission (API送信処理)
  // useResourceCreate Composableを使ってAPIへのPOSTリクエストを管理します。
  // ============================================================================
  const { executeCreate: executeImageCreation, isCreating } = useResourceCreate<
    ImageCreateRequest,
    ImageResponse
  >("images"); // APIエンドポイント '/api/images' に対応
  const { addToast } = useToast();

  /**
   * フォーム送信時の処理を定義します。
   * handleSubmitでラップされているため、バリデーション通過後にのみ実行されます。
   * @param emit - 親コンポーネントへイベントを通知するための関数 ('success', 'close')
   */
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // ファイルオブジェクトが存在することを確認 (バリデーション通過後なので基本的には存在するはず)
      if (!formValues.file) {
        addToast({ message: "ファイルが選択されていません。", type: "error" });
        return;
      }

      // ファイルをBase64文字列に非同期で変換します
      let fileBase64: string;
      try {
        fileBase64 = await readFileAsBase64(formValues.file);
      } catch (error) {
        // ファイル読み込み（Base64変換）に失敗した場合のエラーハンドリング
        addToast({
          message: "ファイルの読み込みに失敗しました。",
          type: "error",
          details: error instanceof Error ? error.message : String(error),
        });
        return; // 処理を中断
      }

      // APIに送信するデータ（ペイロード）を構築します
      const payload: ImageCreateRequestDTO = {
        name: formValues.name,
        description: formValues.description || undefined, // 説明が空文字の場合は undefined として送信 (API仕様による)
        file: fileBase64, // Base64エンコードされたファイルデータ
      };

      // APIリクエストを実行します
      const result = await executeImageCreation(payload);

      // 結果に応じてトースト通知を表示し、親コンポーネントにイベントを通知します
      if (result.success) {
        addToast({
          message: `イメージ「${payload.name}」を追加しました。`,
          type: "success",
        });
        emit("success"); // 成功イベントを通知
        emit("close"); // モーダルを閉じるイベントを通知
      } else {
        addToast({
          message: "イメージの追加に失敗しました。",
          type: "error",
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
    file, // FormDropZone の v-model 用
    // fileAttrs, // FormDropZone では通常 v-bind 不要
    description,
    descriptionAttrs,
    isCreating, // API通信中のローディング状態 (trueの間ボタンが無効化される)
    onFormSubmit, // フォーム送信ハンドラ (バリデーション実行 + API送信)
  };
}
