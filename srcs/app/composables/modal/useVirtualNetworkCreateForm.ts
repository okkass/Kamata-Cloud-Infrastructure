/**
 * =================================================================================
 * 仮想ネットワーク作成フォーム Composable (useVirtualNetworkCreateForm.ts)
 * =================================================================================
 */
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  VirtualNetworkCreateSchema,
  type VirtualNetworkCreateFormValues,
} from "~/utils/validations/virtual-network";

/**
 * 仮想ネットワーク作成フォームのロジック
 */
export function useVirtualNetworkCreateForm() {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { executeCreate, isCreating } = useResourceCreate<
    VirtualNetworkCreateRequest,
    VirtualNetworkResponse
  >(NETWORK.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, defineField, meta, resetForm } =
    useForm<VirtualNetworkCreateFormValues>({
      validationSchema: toTypedSchema(VirtualNetworkCreateSchema),
      initialValues: {
        name: "",
        cidr: "",
      },
    });

  const [name, nameAttrs] = defineField("name");
  const [cidr, cidrAttrs] = defineField("cidr");

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<VirtualNetworkCreateFormValues, VirtualNetworkResponse>(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: VirtualNetworkCreateRequest = {
            name: formValues.name,
            cidr: formValues.cidr,
            initialSubnets: [],
          };
          return await executeCreate(payload);
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `仮想ネットワーク「${payload.name}」が作成されました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    cidr,
    cidrAttrs,
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makehandleClose,
  };
}
