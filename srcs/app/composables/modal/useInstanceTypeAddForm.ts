/**
 * =================================================================================
 * インスタンスタイプ追加フォーム Composable (useInstanceTypeAddForm.ts)
 * =================================================================================
 */
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte } from "~/utils/format";

import type { InstanceTypeCreateRequest } from "~~/shared/types/dto/instance-type/InstanceTypeCreateRequest";
import type { InstanceTypeResponse } from "~~/shared/types/dto/instance-type/InstanceTypeResponse";

// ==============================================================================
// Validation Schema
// ==============================================================================

// まず生の Zod スキーマを定義する
const zodSchema = z.object({
  name: z.string().min(1, "インスタンスタイプ名は必須です。"),
  cpuCore: z
    .number({
      required_error: "CPUコア数は必須です。",
      invalid_type_error: "数値を入力してください。",
    })
    .int("整数で入力してください。")
    .min(1, "1以上の値を入力してください。"),
  memorySizeInMb: z
    .number({
      required_error: "メモリサイズは必須です。",
      invalid_type_error: "数値を入力してください。",
    })
    .int("整数で入力してください。")
    .min(1, "1MB以上の値を入力してください。"),
});

// VeeValidate用には変換したものを使う
const validationSchema = toTypedSchema(zodSchema);

// 型推論には生の Zod スキーマを使う
type FormValues = z.infer<typeof zodSchema>;

/**
 * インスタンスタイプ追加フォームのロジック
 */
export function useInstanceTypeAddForm() {
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    InstanceTypeCreateRequest,
    InstanceTypeResponse
  >("instance-types");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm } = useForm<FormValues>({
    validationSchema, // 変換済みのスキーマを渡す
    initialValues: {
      name: "",
      cpuCore: undefined,
      memorySizeInMb: undefined,
    },
  });

  // --- フィールド定義 ---

  // 1. Name
  const {
    value: name,
    handleBlur: nameBlur,
    handleChange: nameChange,
  } = useField<string>("name");
  const nameAttrs = { onBlur: nameBlur, onChange: nameChange };

  // 2. CPU Core
  const {
    value: cpuCore,
    handleBlur: cpuBlur,
    handleChange: cpuChange,
  } = useField<number | undefined>("cpuCore");
  const cpuCoreAttrs = { onBlur: cpuBlur, onChange: cpuChange };

  // 3. Memory Size (MB)
  const {
    value: memorySizeInMb,
    handleBlur: memBlur,
    handleChange: memChange,
  } = useField<number | undefined>("memorySizeInMb");
  const memorySizeInMbAttrs = { onBlur: memBlur, onChange: memChange };

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      const payload: InstanceTypeCreateRequest = {
        name: formValues.name,
        cpuCore: formValues.cpuCore,
        memorySize: convertUnitToByte(formValues.memorySizeInMb, "MB"),
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          type: "success",
          message: `インスタンスタイプ「${payload.name}」が作成されました`,
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          type: "error",
          message: "作成に失敗しました。",
          details: result.error?.message,
        });
      }
    });

  return {
    errors,
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
