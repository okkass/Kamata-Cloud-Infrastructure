/**
 * =================================================================================
 * バックアップ作成フォーム Composable (useBackupCreateForm.ts)
 * ---------------------------------------------------------------------------------
 * このComposableは、MoBackupCreateコンポーネントで使用される
 * フォームの状態管理、バリデーション、依存関係のあるプルダウンのデータ取得、
 * API送信ロジックをカプセル化します。
 * APIの型定義は `~/shared/types` ディレクトリからインポートします。
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  BackupCreateSchema,
  type BackupCreateInput,
} from "~/utils/validations/backup";

/**
 * メインのComposable関数
 */
export function useBackupCreateForm(emit: any) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { errors, defineField, handleSubmit, setFieldValue, meta, resetForm } =
    useForm<BackupCreateInput>({
      validationSchema: toTypedSchema(BackupCreateSchema),
      initialValues: {
        name: "",
        targetVirtualMachineId: "",
        targetStorageId: "",
      },
    });

  // --- フィールド定義 ---
  const [name, nameAttrs] = defineField("name");
  const [targetVirtualMachineId, targetVirtualMachineIdAttrs] = defineField(
    "targetVirtualMachineId"
  );
  const [targetStorageId, targetStorageIdAttrs] =
    defineField("targetStorageId");

  // --- APIデータ取得 ---
  const {
    data: vms,
    pending: vmsPending,
    error: vmsError,
  } = useResourceList<VirtualMachineResponse>(MACHINE.name);

  // --- 選択中のVMに紐づくストレージ一覧 ---
  const availableStorages = computed(() => {
    const selectedVm = vms.value?.find(
      (vm) => vm.id === targetVirtualMachineId.value
    );
    return selectedVm?.storages?.filter((s) => !!s) ?? [];
  });

  // VMが変わったらストレージ選択をリセット
  watch(
    () => targetVirtualMachineId.value,
    () => {
      setFieldValue("targetStorageId", "");
    }
  );

  // --- 送信ロジック ---
  const { executeCreate, isCreating } = useResourceCreate<
    BackupCreateInput,
    BackupResponse
  >(BACKUP.name);

  const onFormSubmit = (emit: any) =>
    handleFormSubmit<BackupCreateInput, BackupResponse>(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: BackupCreateInput = {
            name: formValues.name,
            targetVirtualMachineId: formValues.targetVirtualMachineId,
            targetStorageId: formValues.targetStorageId,
          };

          const result = await executeCreate(payload);
          return result;
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `バックアップ「${payload.name}」を作成しました。`,
      },
      emit
    );
  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    name,
    nameAttrs,
    targetVirtualMachineId,
    targetVirtualMachineIdAttrs,
    targetStorageId,
    targetStorageIdAttrs,
    errors,
    isValid: computed(() => meta.value.valid),
    vms,
    vmsPending,
    vmsError,
    availableStorages,
    isCreating,
    onFormSubmit,
    makehandleClose,
  };
}
