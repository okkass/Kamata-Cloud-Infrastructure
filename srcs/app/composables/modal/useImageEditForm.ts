/**
 * =================================================================================
 * イメージ編集フォーム Composable (useImageEditForm.ts)
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
import type { ImageServerBase } from "~~/shared/types/dto/image/ImageServerBase";

interface ImageEditProps {
  show: boolean;
  // ★ ImageDTO -> ImageServerBase に変更
  imageData: ImageServerBase | null;
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "イメージ名は必須です。"),
  // ImagePutRequestの定義により description は必須(NonNullable)
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

  const nameAttrs = {
    onBlur: nameBlur,
    onChange: nameChange,
  };

  const {
    value: description,
    handleBlur: descBlur,
    handleChange: descChange,
  } = useField<string>("description");

  const descriptionAttrs = {
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
            // description が undefined の場合は空文字を入れて必須要件を満たす
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
