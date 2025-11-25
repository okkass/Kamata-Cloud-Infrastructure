/**
 * =================================================================================
 * イメージ編集フォーム Composable (useImageEditForm.ts)
 * ---------------------------------------------------------------------------------
 * ★ ImagePutRequest 型定義を利用
 * ★ useField を使用 (互換性維持)
 * ★ name属性の重複エラーを解消 (attrsからnameを除去)
 * =================================================================================
 */
import { watch } from "vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";

import type { ImagePutRequest } from "~~/shared/types/dto/image/ImagePutRequest";
import type { ImageResponse } from "~~/shared/types/dto/image/ImageResponse";

export interface ImageDTO {
  id: string;
  name: string;
  description?: string;
}

interface ImageEditProps {
  show: boolean;
  imageData: ImageDTO | null;
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  description: z.string(),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * イメージ編集フォームのロジック
 */
export function useImageEditForm(props: ImageEditProps) {
  const { addToast } = useToast();

  const { executeUpdate, isUpdating } = useResourceUpdate<
    ImagePutRequest,
    ImageResponse
  >("images");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      description: "",
    },
  });

  // --- フィールド定義 (useField) ---
  const {
    value: name,
    handleBlur: nameBlur,
    handleChange: nameChange,
  } = useField<string>("name");

  // ★★★ 修正箇所: name プロパティを削除 ★★★
  // テンプレート側で name="image-name-edit" を指定しているため、ここでは含めない
  const nameAttrs = {
    // name: "name", // ← 削除
    onBlur: nameBlur,
    onChange: nameChange,
  };

  const {
    value: description,
    handleBlur: descBlur,
    handleChange: descChange,
  } = useField<string>("description");

  // ★★★ 修正箇所: name プロパティを削除 ★★★
  const descriptionAttrs = {
    // name: "description", // ← 削除
    onBlur: descBlur,
    onChange: descChange,
  };

  // ============================================================================
  // 初期値の反映
  // ============================================================================
  watch(
    () => props.imageData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            description: newData.description || "",
          },
        });
      }
    },
    { immediate: true, deep: true }
  );

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "close" | "success") => void) => {
    return handleSubmit(async (formValues) => {
      if (!props.imageData?.id) return;

      const payload: ImagePutRequest = {
        name: formValues.name,
        description: formValues.description,
      } as ImagePutRequest;

      const { success, error, data } = await executeUpdate(
        props.imageData.id,
        payload
      );

      if (success) {
        addToast({
          message: `イメージ「${data?.name ?? payload.name}」を更新しました。`,
          type: "success",
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          message: "イメージの更新に失敗しました。",
          type: "error",
          details: error?.message,
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
    isUpdating,
    onFormSubmit,
  };
}
