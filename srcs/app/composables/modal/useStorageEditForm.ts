/**
 * =================================================================================
 * ストレージプール編集フォーム Composable (useStorageEditForm.ts)
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  StorageEditSchema,
  type StorageEditFormValues,
} from "~/utils/validations/storage";

interface Props {
  show: boolean;
  storageData: StoragePoolResponse | null;
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const validationSchema = toTypedSchema(StorageEditSchema);
type FormValues = StorageEditFormValues;

export function useStorageEditForm(props: Props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<StoragePoolResponse>();

  const { errors, handleSubmit, defineField, meta, resetForm, setValues } =
    useForm<FormValues>({
      validationSchema,
      initialValues: {
        name: "",
        hasNetworkAccess: "false",
      },
    });

  const [name, nameAttrs] = defineField("name");
  const [hasNetworkAccess, hasNetworkAccessAttrs] =
    defineField("hasNetworkAccess");

  // --- 初期化ロジック ---
  watch(
    () => [props.show, props.storageData] as const,
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        setValues({
          name: data.name,
          hasNetworkAccess: String(data.hasNetworkAccess),
        });
      }
    },
    { immediate: true }
  );

  function getResourceConfig(data: StoragePoolResponse): ResourceConfig {
    return {
      base: {
        endpoint: `storage-pools/${data.id}`,
        fields: ["name", "hasNetworkAccess"],
      },
    };
  }

  // --- vee-validate の値を editedData に同期 ---
  watch(
    () => ({ name: name.value, hasNetworkAccess: hasNetworkAccess.value }),
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.hasNetworkAccess =
          newValues.hasNetworkAccess === "true";
      }
    },
    { deep: true }
  );

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<FormValues, StoragePoolResponse>(
      handleSubmit,
      {
        execute: async () => {
          const success = await save();
          return { success };
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: () =>
          `ストレージプール「${name.value}」を更新しました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    hasNetworkAccess,
    hasNetworkAccessAttrs,
    isDirty,
    isValid: computed(() => meta.value.valid),
    isSaving,
    onFormSubmit,
    makehandleClose,
  };
}
