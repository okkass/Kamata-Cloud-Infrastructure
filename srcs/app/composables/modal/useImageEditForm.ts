/**
 * =================================================================================
 * イメージ編集フォーム Composable (useImageEditForm.ts)
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import {
  ImageUpdateSchema,
  type ImageUpdateInput,
} from "~/utils/validations/image";
import { useFormAction } from "~/composables/modal/useModalAction";

type ImageEditProps = ModalFormProps<ImageResponse>;

/**
 * イメージ編集フォームのロジック
 */
export function useImageEditForm(props: ImageEditProps) {
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
    () => props.data,
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
          if (!props.data) {
            return { success: false, error: new Error("No image data") };
          }

          return await executeUpdate(props.data.id, payload);
        },
        onSuccessMessage: (values: ImageUpdateInput) =>
          `イメージ「${values.name}」を更新しました。`,
        onSuccess: () => {
          resetForm();
        },
        emitCloseImmediately: true,
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
