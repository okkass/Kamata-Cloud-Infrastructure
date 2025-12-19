import { ref, computed } from "vue";
import { useToast } from "~/composables/useToast";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { convertByteToUnit, convertUnitToByte } from "~/utils/format";

// バリデーションスキーマ
const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "名前は必須です"),
    cpuCore: z.coerce
      .number()
      .refine((v) => Number.isFinite(v), { message: "数値を入力してください" })
      .min(1, "vCPUは1以上である必要があります"),
    memorySizeGB: z.coerce
      .number()
      .refine((v) => Number.isFinite(v), { message: "数値を入力してください" })
      .min(1, "メモリは1GB以上である必要があります"),
  })
);

export const useInstanceTypeEditForm = () => {
  const { addToast } = useToast();

  // [推奨]: useResourceUpdater の戻り値を活用
  const {
    editedData,
    dirtyState,
    isSaving,
    init,
    save: updaterSave,
    errorMessage,
  } = useResourceUpdater<InstanceTypeResponse>();

  // エラーメッセージを同期
  const updaterError = errorMessage;

  // VeeValidate フォーム設定
  const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
    validationSchema,
  });

  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySizeGBField, memorySizeGBAttrs] = defineField("memorySizeGB");

  // [必須]: メモリサイズ(Bytes)とUI表示(GB)の変換用Computed
  // VeeValidateのフィールドと同期させる
  const memorySizeGB = computed<number>({
    get: () =>
      (typeof memorySizeGBField.value === "number"
        ? memorySizeGBField.value
        : Number(memorySizeGBField.value)) || 0,
    set: (val: number) => {
      memorySizeGBField.value = val;
      if (editedData.value) {
        editedData.value.memorySize = convertUnitToByte(val, "GB");
      }
    },
  });

  // 名前とCPUも同期
  const syncedName = computed({
    get: () => name.value || "",
    set: (val) => {
      name.value = val;
      if (editedData.value) editedData.value.name = val;
    },
  });

  const syncedCpuCore = computed<number>({
    get: () =>
      (typeof cpuCore.value === "number"
        ? cpuCore.value
        : Number(cpuCore.value)) || 0,
    set: (val: number) => {
      cpuCore.value = val;
      if (editedData.value) editedData.value.cpuCore = val;
    },
  });

  /**
   * フォーム初期化
   */
  const initializeForm = (data: InstanceTypeResponse) => {
    // [推奨]: endpoint を設定し、データ変換は行わない (Bytesのまま扱う)
    const config: ResourceConfig = {
      base: {
        endpoint: `instance-types/${data.id}`,
        fields: ["name", "cpuCore", "memorySize"],
      },
    };

    init(data, config);

    // VeeValidateの初期値を設定
    resetForm({
      values: {
        name: data.name,
        cpuCore: data.cpuCore,
        memorySizeGB: convertByteToUnit(data.memorySize, "GB"),
      },
    });
  };

  /**
   * 保存処理
   * [推奨]: useResourceUpdater の save() を使用して標準化
   */
  const save = handleSubmit(async () => {
    if (!editedData.value) return;

    const success = await updaterSave();

    if (success) {
      addToast({ type: "success", message: "保存しました。" });
      return true;
    } else {
      addToast({
        type: "error",
        message: "保存に失敗しました。",
        details: updaterError.value || undefined,
      });
      return false;
    }
  });

  return {
    editedData,
    // バリデーション用フィールド
    name: syncedName,
    nameAttrs,
    cpuCore: syncedCpuCore,
    cpuCoreAttrs,
    memorySizeGB,
    memorySizeGBAttrs,
    errors,

    dirtyState, // [推奨]: dirtyState を公開
    isSaving,
    updaterError,
    initializeForm,
    save,
  };
};
