/**
 * =================================================================================
 * スナップショット作成フォーム Composable (useSnapshotCreateForm.ts)
 * =================================================================================
 */
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";

// ==============================================================================
// Validation Schema
// ==============================================================================
const zodSchema = z.object({
  name: z.string().min(1, "スナップショット名は必須です。"),
  vmId: z
    .string({ message: "対象の仮想マシンを選択してください。" })
    .min(1, "対象の仮想マシンを選択してください。"),
  description: z.string().optional(),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * スナップショット作成フォームのロジック
 */
export function useSnapshotCreateForm() {
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    SnapshotCreateRequest,
    any
  >("snapshots");

  const {
    data: virtualMachines,
    pending: vmsPending,
    error: vmsError,
  } = useResourceList<VirtualMachineResponse>("virtual-machines");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, defineField, resetForm } = useForm<FormValues>({
    validationSchema,
    initialValues: {
      name: "",
      vmId: "",
      description: "",
    },
  });

  const [name, nameAttrs] = defineField("name");
  const [vmId, vmAttrs] = defineField("vmId");
  const [description, descriptionAttrs] = defineField("description");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      const payload: SnapshotCreateRequest = {
        name: formValues.name,
        targetVmId: formValues.vmId,
        description: formValues.description,
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          type: "success",
          message: `スナップショット「${payload.name}」を作成しました。`,
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
    vmId,
    vmAttrs,
    description,
    descriptionAttrs,
    virtualMachines,
    vmsPending,
    vmsError,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
