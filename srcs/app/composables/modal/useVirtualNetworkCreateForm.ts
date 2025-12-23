/**
 * =================================================================================
 * 仮想ネットワーク作成フォーム Composable (useVirtualNetworkCreateForm.ts)
 * =================================================================================
 */
import { computed } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useFormAction } from "~/composables/modal/useModalAction";
import { useToast } from "~/composables/useToast";
import { type SubnetFormValues } from "~/utils/validations/virtual-network";
import {
  VirtualNetworkCreateFullSchema,
  type VirtualNetworkCreateFullFormValues,
} from "~/utils/validations/virtual-network";

/**
 * 仮想ネットワーク作成フォームのロジック
 */
export function useVirtualNetworkCreateForm(emit: any) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    VirtualNetworkCreateRequest,
    VirtualNetworkResponse
  >(NETWORK.name);

  const { errors, handleSubmit, defineField, meta, resetForm, values } =
    useForm<VirtualNetworkCreateFullFormValues>({
      validationSchema: toTypedSchema(VirtualNetworkCreateFullSchema),
      initialValues: {
        name: "",
        cidr: "",
        initialSubnets: [],
      },
    });

  const [name, nameAttrs] = defineField("name");
  const [cidr, cidrAttrs] = defineField("cidr");

  // --- サブネット配列 (useFieldArray) ---
  const {
    fields: initialSubnets,
    push: pushSubnet,
    remove: removeSubnet,
  } = useFieldArray<SubnetFormValues>("initialSubnets");

  const addSubnet = () => {
    pushSubnet({
      id: `new-${Date.now()}`,
      name: "",
      cidr: "",
    });
  };

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<
      VirtualNetworkCreateFullFormValues,
      VirtualNetworkResponse
    >(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: VirtualNetworkCreateRequest = {
            name: formValues.name,
            cidr: formValues.cidr,
            initialSubnets: formValues.initialSubnets.map((subnet) => ({
              name: subnet.name,
              cidr: subnet.cidr,
            })),
          };
          return await executeCreate(payload);
        },
        onSuccess: async () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `仮想ネットワーク「${payload.name}」を作成しました。`,
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
    initialSubnets,
    addSubnet,
    removeSubnet,
    isCreating,
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose,
  };
}
