/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * =================================================================================
 */
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";

// 型定義のインポート
import type { ImageCreateRequest } from "~~/shared/types/dto/image/ImageCreateRequest";
import type { ImageResponse } from "~~/shared/types/dto/image/ImageResponse";
import type { NodeDTO } from "~~/shared/types/dto/node/NodeDTO";

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  file: z.instanceof(File, { message: "イメージファイルを選択してください。" }),
  description: z.string().optional(),
  nodeId: z
    .string({ required_error: "作成先ノードを選択してください。" })
    .min(1, "作成先ノードを選択してください。"),
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

  const { executeCreate, isCreating } = useResourceCreate<
    ImageCreateRequest,
    ImageResponse
  >("images");

  // ============================================================================
  // ノード一覧の取得 (GET /api/nodes)
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

  // name属性の重複エラーを防ぐため、attrs に name を含めない
  const nameAttrs = {
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
    onBlur: descBlur,
    onChange: descChange,
  };

  // 3. file
  const { value: file } = useField<File | undefined>("file");

  // 4. nodeId
  const {
    value: nodeId,
    handleBlur: nodeIdBlur,
    handleChange: nodeIdChange,
  } = useField<string>("nodeId");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      try {
        const fileBase64 = await convertFileToBase64(formValues.file);

        // ペイロード構築
        const payload: any = {
          name: formValues.name,
          description: formValues.description || undefined,
          file: fileBase64,
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
    nodeId,
    nodes,
    nodesPending,
    nodesError,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
