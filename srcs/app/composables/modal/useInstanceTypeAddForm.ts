/**
 * =================================================================================
 * インスタンスタイプ追加フォーム Composable (useInstanceTypeAddForm.ts)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { convertUnitToByte } from "~/utils/format";
import {
  InstanceTypeCreateSchema,
  type InstanceTypeCreateInput,
} from "~/utils/validations/instance-type";
import { useFormAction } from "~/composables/modal/useModalAction";

/**
 * インスタンスタイプ追加フォームのロジック
 */
export function useInstanceTypeAddForm() {
  const { handleFormSubmit, makeHandleClose: createHandleClose } =
    useFormAction();

  const { executeCreate, isCreating } = useResourceCreate<
    InstanceTypeCreateInput,
    InstanceTypeResponse
  >(INSTANCE_TYPE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  // ★ defineField を useForm から取得
  const { errors, handleSubmit, resetForm, defineField, meta } =
    useForm<InstanceTypeCreateInput>({
      validationSchema: toTypedSchema(InstanceTypeCreateSchema), // 変換済みのスキーマを渡す
      initialValues: {
        name: "",
        cpuCore: undefined,
        memorySize: undefined,
      },
    });

  // --- フィールド定義 (defineField) ---
  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySize, memorySizeAttrs] = defineField("memorySize");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<InstanceTypeCreateInput, InstanceTypeResponse>(
      handleSubmit,
      {
        // API実行ロジック
        execute: async (payload: InstanceTypeCreateInput) => {
          return await executeCreate({
            name: payload.name,
            cpuCore: payload.cpuCore!,
            memorySize: convertUnitToByte(payload.memorySize!, "MB")!,
          });
        },
        onSuccessMessage: (values: InstanceTypeCreateInput) =>
          `インスタンスタイプ「${values.name}」を作成しました。`,
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
    cpuCore,
    cpuCoreAttrs,
    memorySize,
    memorySizeAttrs,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makeHandleClose,
  };
}
