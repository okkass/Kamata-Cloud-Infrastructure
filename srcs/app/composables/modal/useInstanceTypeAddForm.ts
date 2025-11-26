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
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "インスタンスタイプ名は必須です。"),
    cpuCores: z
      .number({
        message: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1以上の値を入力してください。"),
    memorySizeInMb: z
      .number({
        message: "数値を入力してください。",
      })
      .int("整数で入力してください。")
      .min(1, "1MB以上の値を入力してください。"),
  })
);

type FormValues = z.infer<typeof validationSchema>;

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
    validationSchema,
    initialValues: {
      name: "",
      cpuCores: undefined,
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

  // ★★★ 修正箇所: name プロパティを削除 ★★★
  const nameAttrs = {
    // name: "name", // ← 削除 (テンプレート側の name="instance-type-name" と競合するため)
    onBlur: nameBlur,
    onChange: nameChange,
  };

  // 2. CPU Cores
  const {
    value: cpuCores,
    handleBlur: cpuBlur,
    handleChange: cpuChange,
  } = useField<number | undefined>("cpuCores");

  // ★★★ 修正箇所: name プロパティを削除 ★★★
  const cpuCoresAttrs = {
    // name: "cpuCores", // ← 削除
    onBlur: cpuBlur,
    onChange: cpuChange,
  };

  // 3. Memory Size
  const {
    value: memorySizeInMb,
    handleBlur: memBlur,
    handleChange: memChange,
  } = useField<number | undefined>("memorySizeInMb");

  // ★★★ 修正箇所: name プロパティを削除 ★★★
  const memorySizeInMbAttrs = {
    // name: "memorySizeInMb", // ← 削除
    onBlur: memBlur,
    onChange: memChange,
  };

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      const payload: InstanceTypeCreateRequest = {
        name: formValues.name,
        cpuCore: formValues.cpuCores,
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
    cpuCores,
    cpuCoresAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
