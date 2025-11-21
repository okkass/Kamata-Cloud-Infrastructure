/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ ノード選択 (nodeId) のロジックを追加
 * =================================================================================
 */
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
// ★ リソース一覧取得用 Composable をインポート
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";

import type { ImageCreateRequest } from "~~/shared/types/dto/image/ImageCreateRequest";
import type { ImageResponse } from "~~/shared/types/dto/image/ImageResponse";

// ★ ノードの型定義 (画像2枚目 GET /api/nodes のレスポンス参考)
interface NodeDTO {
  id: string;
  name: string;
  hostname: string;
  // ... 他のプロパティは省略
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  description: z.string().optional(),
  // ★ nodeId のバリデーションを追加
  nodeId: z
    .string({ required_error: "作成先ノードを選択してください。" })
    .min(1, "作成先ノードを選択してください。"),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

// (convertFileToBase64 ヘルパー関数は変更なし)
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

  const { executeCreate, isCreating } = useResourceCreate<
    ImageCreateRequest,
    ImageResponse
  >("images");

  // ============================================================================
  // ★ ノード一覧の取得 (GET /api/nodes)
  // ============================================================================
  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError,
  } = useResourceList<NodeDTO>("nodes");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
      file: undefined,
      // ★ 初期値
      nodeId: "",
    },
  });

  // --- フィールド定義 (useField) ---

  // 1. name
  const {
    value: name,
    handleBlur: nameBlur,
    handleChange: nameChange,
  } = useField<string>("name");
  const nameAttrs = { name: "name", onBlur: nameBlur, onChange: nameChange };

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

  // 3. file
  const { value: file } = useField<File | undefined>("file");

  // 4. ★ nodeId (新規追加)
  const {
    value: nodeId,
    handleBlur: nodeIdBlur,
    handleChange: nodeIdChange,
  } = useField<string>("nodeId");
  // Selectコンポーネントには通常 v-model を渡すだけで十分ですが、
  // 属性が必要な場合は以下のように定義します
  // const nodeIdAttrs = { name: "nodeId", onBlur: nodeIdBlur, onChange: nodeIdChange };

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      try {
        const fileBase64 = await convertFileToBase64(formValues.file);

        // ペイロード構築
        // Note: 型定義ファイル(ImageCreateRequest)に nodeId がまだ追加されていない場合
        // エラーになるため、一時的に `as any` 等で回避するか、型定義を更新してください。
        const payload: any = {
          name: formValues.name,
          description: formValues.description || undefined,
          file: fileBase64,
          // ★ nodeId を追加 (画像1枚目の仕様)
          nodeId: formValues.nodeId,
        };

        const result = await executeCreate(payload);

        if (result.success) {
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
        console.error("Error:", error);
        addToast({
          message: "処理中にエラーが発生しました。",
          type: "error",
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
    file,
    // ★ ノード関連のデータを公開
    nodeId,
    nodes,
    nodesPending,
    nodesError,

    isCreating,
    onFormSubmit,
    resetForm,
  };
}
