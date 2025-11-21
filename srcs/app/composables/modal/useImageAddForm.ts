/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * =================================================================================
 */
import { ref } from "vue";
import { useForm, useField } from "vee-validate"; // useField を使用
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";

// ★ リクエスト型定義
import type { ImageCreateRequest } from "~~/shared/types/dto/image/ImageCreateRequest";
// ★ レスポンス型定義 (ImageServerBase を継承した ImageResponse)
import type { ImageResponse } from "~~/shared/types/dto/image/ImageResponse";

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  // ファイルは必須。 Fileオブジェクトであることを確認します
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  description: z.string().optional(),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * ファイルをBase64文字列に変換するヘルパー関数
 */
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to Base64 string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * イメージ追加フォームのロジック
 */
export function useImageAddForm() {
  const { addToast } = useToast();

  // ★ useResourceCreate の型引数を共有型定義に変更
  // Request: ImageCreateRequest, Response: ImageResponse
  const { executeCreate, isCreating } = useResourceCreate<
    ImageCreateRequest,
    ImageResponse
  >("images");

  // ============================================================================
  // Form Setup (VeeValidate)
  // ============================================================================
  const { errors, handleSubmit, resetForm } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
      file: undefined,
    },
  });

  // --- フィールド定義 (useField を使用) ---

  // 1. name
  const {
    value: name,
    handleBlur: nameBlur,
    handleChange: nameChange,
  } = useField<string>("name");
  const nameAttrs = {
    name: "name",
    onBlur: nameBlur,
    onChange: nameChange,
  };

  // 2. description
  const {
    value: description,
    handleBlur: descBlur,
    handleChange: descChange,
  } = useField<string>("description");
  const descriptionAttrs = {
    name: "description",
    onBlur: descBlur,
    onChange: descChange,
  };

  // 3. file (FormDropZone用)
  const { value: file } = useField<File | undefined>("file");

  // ============================================================================
  // Submission Handler (送信処理)
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      try {
        // ファイルをBase64に変換
        const fileBase64 = await convertFileToBase64(formValues.file);

        // APIに送信するデータ（ペイロード）を構築
        const payload: ImageCreateRequest = {
          name: formValues.name,
          description: formValues.description || undefined,
          file: fileBase64,
        } as ImageCreateRequest;

        // APIリクエストを実行
        const result = await executeCreate(payload);

        if (result.success) {
          // 成功時のメッセージ (result.data は ImageResponse 型)
          addToast({
            message: `イメージ「${
              result.data?.name ?? payload.name
            }」を追加しました。`,
            type: "success",
          });
          emit("success");
          emit("close");
        } else {
          addToast({
            message: "イメージの追加に失敗しました。",
            type: "error",
            details: result.error?.message,
          });
        }
      } catch (error) {
        console.error("File conversion error:", error);
        addToast({
          message: "ファイルの処理中にエラーが発生しました。",
          type: "error",
        });
      }
    });
  };

  // ============================================================================
  // Expose
  // ============================================================================
  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    file, // FormDropZone用
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
