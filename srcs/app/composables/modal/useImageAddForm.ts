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
  // ★ 重複警告回避: defineFieldが生成する props から 'name' を除外する
  const nameAttrs = computed(() => {
    const { name: _, ...rest } = nameProps.value;
    return rest;
  });

  // 2. description
  const [description, descriptionProps] = defineField("description");
  // ★ 重複警告回避
  const descriptionAttrs = computed(() => {
    const { name: _, ...rest } = descriptionProps.value;
    return rest;
  });

  // 3. file (FormDropZone用)
  const [file] = defineField("file");

  // 4. nodeId
  const [nodeId] = defineField("nodeId");

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
