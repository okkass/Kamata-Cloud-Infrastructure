/**
 * =================================================================================
 * インスタンスタイプ編集フォーム Composable (useInstanceTypeEditForm.ts)
 * =================================================================================
 */
import { watch, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceUpdate } from "~/composables/useResourceEdit";
import { useToast } from "~/composables/useToast";
import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

// 型定義
import type { InstanceTypePutRequest } from "~~/shared/types/dto/instance-type/InstanceTypePutRequest";
import type { InstanceTypeResponse } from "~~/shared/types/dto/instance-type/InstanceTypeResponse";
import type { InstanceTypeServerBase } from "~~/shared/types/dto/instance-type/InstanceTypeServerBase";

// Props の型定義
interface InstanceTypeEditProps {
  show: boolean;
  instanceTypeData: InstanceTypeServerBase | null;
}

// ==============================================================================
// Validation Schema
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
  >(INSTANCE_TYPE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  // defineField を分割代入で取得
  const { errors, handleSubmit, resetForm, defineField } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      cpuCore: undefined,
      memorySizeInMb: undefined,
    },
  });

  // --- フィールド定義 (defineField) ---
const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySizeInMb, memorySizeInMbAttrs] = defineField("memorySizeInMb");

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

      const payload: InstanceTypePutRequest = {
        name: formValues.name,
        cpuCore: formValues.cpuCore,
        memorySize: convertUnitToByte(formValues.memorySizeInMb, "MB"),
      };

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
