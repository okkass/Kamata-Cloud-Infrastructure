import { computed, watch } from "vue";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  InstanceTypeUpdateSchema,
  type InstanceTypeUpdateInput,
} from "~/utils/validations/instance-type";
import { useFormAction } from "./useModalAction";
import { convertUnitToByte } from "~/utils/format";

type Props = ModalFormProps<InstanceTypeResponse>;

export const useInstanceTypeEditForm = (props: Props) => {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { addToast } = useToast();

  // [推奨]: useResourceUpdater の戻り値を活用
  const {
    editedData,
    dirtyState,
    isSaving,
    init,
    save: updaterSave,
    errorMessage,
    isDirty,
  } = useResourceUpdater<InstanceTypeResponse>();

  // エラーメッセージを同期
  const updaterError = errorMessage;

  // VeeValidate フォーム設定
  const { errors, defineField, handleSubmit, resetForm, meta } =
    useForm<InstanceTypeUpdateInput>({
      validationSchema: toTypedSchema(InstanceTypeUpdateSchema),
    });

  const [name, nameAttrs] = defineField("name");
  const [cpuCore, cpuCoreAttrs] = defineField("cpuCore");
  const [memorySizeField, memorySizeAttrs] = defineField("memorySize");

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
        memorySize: convertByteToUnit(data.memorySize, "MB"),
      },
    });
  };

  // --- propsの監視で初期化 ---
  watch(
    () => [props.show, props.data] as const,
    ([show, data]) => {
      if (show && data) {
        initializeForm(data);
      }
    },
    { immediate: true }
  );

  // --- vee-validate の値を editedData に同期 ---
  watch(
    () => ({
      name: name.value,
      cpuCore: cpuCore.value,
      memorySize: memorySizeField.value,
    }),
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.cpuCore = newValues.cpuCore;
        if (newValues.memorySize != null) {
          editedData.value.memorySize = convertUnitToByte(
            newValues.memorySize,
            "MB"
          );
        }
      }
    },
    { deep: true }
  );

  /**
   * 保存処理
   * [推奨]: useResourceUpdater の save() を使用して標準化
   */
  const save = (emit: any) => {
    const submitHandler = handleFormSubmit<
      InstanceTypeUpdateInput,
      InstanceTypeResponse
    >(
      handleSubmit,
      {
        execute: async () => {
          const success = await updaterSave();
          return { success };
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: () =>
          `インスタンスタイプ「${name.value}」を更新しました。`,
      },
      emit
    );

    return async (e?: Event) => {
      if (!isDirty.value) {
        addToast({
          message: "変更がありません。",
          type: "info",
        });
        return;
      }
      return submitHandler(e);
    };
  };

  const close = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    editedData,
    // バリデーション用フィールド
    name,
    nameAttrs,
    cpuCore,
    cpuCoreAttrs,
    memorySizeField,
    memorySizeAttrs,
    errors,

    dirtyState, // [推奨]: dirtyState を公開
    isSaving,
    updaterError,
    isValid: computed(() => meta.value.valid),
    save,
    close,
  };
};
