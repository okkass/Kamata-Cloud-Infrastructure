/**
 * =================================================================================
 * スナップショット作成フォーム Composable (useSnapshotCreateForm.ts)
 * =================================================================================
 */
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  snapshotCreateSchema,
  type snapshotCreateFormValues,
} from "~/utils/validations/snapshot";

/**
 * スナップショット作成フォームのロジック
 */
export function useSnapshotCreateForm(emit: any) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { executeCreate, isCreating } = useResourceCreate<
    SnapshotCreateRequest,
    SnapshotResponse
  >(SNAPSHOT.name);

  const {
    data: virtualMachines,
    pending: vmsPending,
    error: vmsError,
  } = useResourceList<VirtualMachineResponse>(MACHINE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, defineField, meta, resetForm } =
    useForm<snapshotCreateFormValues>({
      validationSchema: toTypedSchema(snapshotCreateSchema),
      initialValues: {
        name: "",
        targetVmId: "",
        description: "",
      },
    });

  const [name, nameAttrs] = defineField("name");
  const [targetVmId, targetVmIdAttrs] = defineField("targetVmId");
  const [description, descriptionAttrs] = defineField("description");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<SnapshotCreateRequest, SnapshotResponse>(
      handleSubmit,
      {
        execute: async (values) => {
          const payload: SnapshotCreateRequest = {
            name: values.name,
            targetVmId: values.targetVmId,
            description: values.description,
          };
          return await executeCreate(payload);
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `スナップショット「${payload.name}」を作成しました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    targetVmId,
    targetVmIdAttrs,
    description,
    descriptionAttrs,
    virtualMachines,
    vmsPending,
    vmsError,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose,
  };
}
