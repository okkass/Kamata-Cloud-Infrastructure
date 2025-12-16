/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ defineField を使用したバージョン
 * ★ name属性の重複警告を回避するための処理込み
 * =================================================================================
 */
import { computed } from "vue";
import { useForm } from "vee-validate"; // defineField は useForm の戻り値に含まれます
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useLargeFileUpload } from "~/composables/useLargeFileUpload";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";

// 型定義
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
    .string({ message: "作成先ノードを選択してください。" })
    .min(1, "作成先ノードを選択してください。"),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * イメージ追加フォームのロジック
 */
export function useImageAddForm() {
  const { addToast } = useToast();
  const { uploadFile, cancelUpload, isUploading, progress } =
    useLargeFileUpload();
  const { executeCreate, isCreating } = useResourceCreate<
    ImageCreateRequest,
    ImageResponse
  >("images");

  // ノード一覧取得
  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError,
  } = useResourceList<NodeDTO>("nodes");

  // ============================================================================
  // Form Setup
  // ============================================================================
  // defineField を useForm から取得
  const { errors, handleSubmit, resetForm, defineField } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
      file: undefined,
      nodeId: "",
    },
  });

  // --- フィールド定義 (defineField) ---

  // 1. name
  const [name, nameProps] = defineField("name");

  // 2. description
  const [description, descriptionProps] = defineField("description");
  
  // 3. file (FormDropZone用)
  const [file] = defineField("file");

  // 4. nodeId
  const [nodeId] = defineField("nodeId");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues: FormValues) => {
      // バリデーション (ファイル必須チェックなど)
      if (!formValues.file) return;

      try {
        // ★ 1. 型安全なオブジェクトを作成 (ここで型チェックが効く！)
        const requestData: ImageUploadRequest = {
          name: formValues.name,
          nodeId: formValues.nodeId,
          description: formValues.description || undefined,
          file: formValues.file, // Fileオブジェクトをそのまま渡す
        };

        // ★ 2. ユーティリティで一発変換
        const formData = toFormData(requestData);
        const result = await uploadFile("/api/images", formData);

        // 成功時の処理 (resultの形式に合わせて調整)
        if (result && !result.error) {
          addToast({
            message: `イメージ「${formValues.name}」を追加しました。`,
            type: "success",
          });
          emit("success");
          emit("close");
        } else {
          // エラー処理
          throw new Error(result?.error || "Upload failed");
        }
      } catch (error: any) {
        console.error("Error:", error);
        addToast({
          message: "アップロードに失敗しました。",
          type: "error",
          details: error.message,
        });
      }
    });
  };

  return {
    errors,
    name,
    description,
    file,
    nodeId,
    nodes,
    nodesPending,
    nodesError,

    isCreating: isUploading,
    onFormSubmit,
    resetForm,
    progress,
    isUploading,
    cancelUpload,
  };
}
