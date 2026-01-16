/**
 * =================================================================================
 * イメージ追加フォーム Composable (useImageAddForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ defineField を使用したバージョン
 * ★ name属性の重複警告を回避するための処理込み
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useLargeFileUpload } from "~/composables/useLargeFileUpload";
import { useResourceList } from "~/composables/useResourceList";
import {
  ImageCreateSchema,
  type ImageCreateInput,
} from "~/utils/validations/image";
import { useFormAction } from "~/composables/modal/useModalAction";
import { extractErrorMessage } from "~/utils/errorHandler";

/**
 * イメージ追加フォームのロジック
 */
export function useImageAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } =
    useFormAction();
  const { uploadFile, cancelUpload, isUploading, progress } =
    useLargeFileUpload();

  // ノード一覧取得
  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError,
  } = useResourceList<NodeResponse>(NODE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  // defineField を useForm から取得
  const { errors, handleSubmit, resetForm, defineField, meta } =
    useForm<ImageCreateInput>({
      validationSchema: toTypedSchema(ImageCreateSchema),
      initialValues: {
        name: "",
        description: "",
        file: undefined,
        nodeId: "",
      },
    });

  // --- フィールド定義 (defineField) ---

  // 1. name
  const [name, nameAttrs] = defineField("name");

  // 2. description
  const [description, descriptionAttrs] = defineField("description");

  // 3. file (FormDropZone用)
  const [file] = defineField("file");

  // 4. nodeId
  const [nodeId, nodeIdAttrs] = defineField("nodeId");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<ImageCreateInput, ImageResponse>(
      handleSubmit,
      {
        // API実行ロジック
        execute: async (payload: ImageCreateInput) => {
          if (!payload.file) {
            return {
              success: false,
              error: new Error("ファイルが選択されていません。"),
            };
          }

          try {
            const formData = new FormData();
            formData.append("file", payload.file);
            formData.append("name", payload.name);
            formData.append("description", payload.description || "");
            formData.append("nodeId", payload.nodeId);

            await uploadFile("images", formData);
            return { success: true };
          } catch (error: unknown) {
            const message = extractErrorMessage(
              error,
              "ファイルのアップロードに失敗しました。"
            );
            return { success: false, error: new Error(message) };
          }
        },
        // 成功メッセージ
        onSuccessMessage: (values: ImageCreateInput) =>
          `イメージ「${values.name}」のアップロードが完了しました。`,
        // 成功時処理
        onSuccess: () => resetForm(),
      },
      emit
    );

  // ★ Close ハンドラーを emit 付きで返す
  const makeHandleClose = (emit: any) => createHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    file,
    nodeId,
    nodeIdAttrs,
    nodes,
    nodesPending,
    nodesError,

    isCreating: isUploading,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makeHandleClose,
    resetForm,
    progress,
    isUploading,
    cancelUpload,
  };
}
