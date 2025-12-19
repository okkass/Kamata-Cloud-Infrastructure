/**
 * =================================================================================
 * イメージ編集フォーム Composable (useImageEditForm.ts)
 * =================================================================================
 */
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import {
  ImageUpdateSchema,
  type ImageUpdateInput,
} from "~/utils/validations/image";
import { useFormAction } from "~/composables/modal/useModalAction";
import { isValid } from "zod/v3";

interface ImageEditProps {
  show: boolean;
  imageData: ImageResponse | null;
}

/**
 * イメージ編集フォームのロジック
 */
export function useImageEditForm(props: ImageEditProps) {
  const { addToast } = useToast();
  const { handleFormSubmit, makeHandleClose: createHandleClose } =
    useFormAction();

  const { executeUpdate, isUpdating } = useResourceUpdate<
    ImageUpdateInput,
    ImageResponse
  >(IMAGE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm, defineField, meta } =
    useForm<ImageUpdateInput>({
      validationSchema: toTypedSchema(ImageUpdateSchema),
      initialValues: {
        name: "",
        description: "",
      },
    });

  // --- フィールド定義 (useField) ---
  const [name, nameAttrs] = defineField("name");
  const [description, descriptionAttrs] = defineField("description");

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
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<ImageUpdateInput, ImageResponse>(
      handleSubmit,
      {
        // API実行ロジック
        execute: async (payload: ImageUpdateInput) => {
          if (!props.imageData) {
            return { success: false, error: new Error("No image data") };
          }

          return await executeUpdate(props.imageData.id, payload);
        },
        onSuccessMessage: (values: ImageUpdateInput) =>
          `イメージ「${values.name}」を更新しました。`,
        onSuccess: () => {
          resetForm();
        },
      },
      emit
    );

  // ★ Close ハンドラーのファクトリ
  const makeHandleClose = (emit: any) => createHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    isUpdating,
    isValid: computed(() => meta.value.valid),
    makeHandleClose,
    onFormSubmit,
  };
}
