/**
 * =================================================================================
 * インスタンスタイプ編集フォーム Composable (useInstanceTypeEditForm.ts)
 * =================================================================================
 */
import { watch } from "vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

import type { InstanceTypePutRequest } from "~~/shared/types/dto/instance-type/InstanceTypePutRequest";
import type { InstanceTypeResponse } from "~~/shared/types/dto/instance-type/InstanceTypeResponse";
import type { InstanceTypeServerBase } from "~~/shared/types/dto/instance-type/InstanceTypeServerBase";

// Props の型定義
interface InstanceTypeEditProps {
  show: boolean;
  // 編集対象データ (ServerBase)
  instanceTypeData: InstanceTypeServerBase | null;
}

// ==============================================================================
// Validation Schema
// ==============================================================================
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

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * インスタンスタイプ編集フォームのロジック
 */
export function useInstanceTypeEditForm(props: InstanceTypeEditProps) {
  const { addToast } = useToast();

  const { executeUpdate, isUpdating } = useResourceUpdate<
    InstanceTypePutRequest,
    InstanceTypeResponse
  >("instance-types");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      cpuCore: undefined,
      memorySizeInMb: undefined,
    },
  });

  // --- フィールド定義 (useField) ---

  // 1. Name
  const {
    value: name,
    handleBlur: nameBlur,
    handleChange: nameChange,
  } = useField<string>("name");
  // name属性の重複を防ぐため、attrsにはnameを含めない
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
  // 初期値の反映 (Watch)
  // ============================================================================
  watch(
    () => props.instanceTypeData,
    (newData) => {
      if (props.show && newData) {
        resetForm({
          values: {
            name: newData.name,
            cpuCore: newData.cpuCore,
            // Byte -> MB 変換
            memorySizeInMb: convertByteToUnit(newData.memorySize, "MB"),
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
      if (!props.instanceTypeData?.id) return;

      // ペイロード作成: InstanceTypePutRequest 型に準拠
      const payload: InstanceTypePutRequest = {
        name: formValues.name,
        cpuCore: formValues.cpuCore,
        // MB -> Byte 変換
        memorySize: convertUnitToByte(formValues.memorySizeInMb, "MB"),
      };

      // APIリクエスト (PUT)
      const { success, error, data } = await executeUpdate(
        props.instanceTypeData.id,
        payload
      );

      if (success) {
        addToast({
          message: `インスタンスタイプ「${
            data?.name ?? payload.name
          }」を更新しました。`,
          type: "success",
        });
        emit("success");
        emit("close");
      } else {
        addToast({
          message: "インスタンスタイプの更新に失敗しました。",
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
    cpuCore,
    cpuCoreAttrs,
    memorySizeInMb,
    memorySizeInMbAttrs,
    isUpdating,
    onFormSubmit,
  };
}
