/**
 * =================================================================================
 * インスタンスタイプ追加フォーム Composable (useInstanceTypeAddForm.ts)
 * =================================================================================
 */
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useToast } from "~/composables/useToast";
import { convertUnitToByte } from "~/utils/format";

import type { InstanceTypeCreateRequest } from "~~/shared/types/dto/instance-type/InstanceTypeCreateRequest";
import type { InstanceTypeResponse } from "~~/shared/types/dto/instance-type/InstanceTypeResponse";

// ==============================================================================
// Validation Schema (バリデーションスキーマ)
// ==============================================================================

const zodSchema = z.object({
  name: z.string().min(1, "インスタンスタイプ名は必須です。"),
  cpuCore: z
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
});

// VeeValidate用に変換
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
  // ★ defineField を useForm から取得
  const { errors, handleSubmit, resetForm, defineField } = useForm<FormValues>({
    validationSchema, // 変換済みのスキーマを渡す
    initialValues: {
      name: "",
      cpuCore: undefined,
      memorySizeInMb: undefined,
    },
  });

  // --- フィールド定義 (defineField) ---

  // 1. Name
  const [name, nameProps] = defineField("name");
  const nameAttrs = computed(() => {
    const { name: _, ...rest } = nameProps.value;
    return rest;
  });

  // 2. CPU Core
  const [cpuCore, cpuCoreProps] = defineField("cpuCore");
  const cpuCoreAttrs = computed(() => {
    const { name: _, ...rest } = cpuCoreProps.value;
    return rest;
  });

  // 3. Memory Size (MB)
  const [memorySizeInMb, memProps] = defineField("memorySizeInMb");
  const memorySizeInMbAttrs = computed(() => {
    const { name: _, ...rest } = memProps.value;
    return rest;
  });

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
