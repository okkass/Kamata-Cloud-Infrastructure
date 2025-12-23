/**
 * =================================================================================
 * 仮想ネットワーク編集フォーム Composable (useVirtualNetworkEditForm.ts)
 * =================================================================================
 */
import { computed, watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  useResourceUpdater,
  type ResourceConfig,
} from "~/composables/useResourceUpdater";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  VirtualNetworkEditSchema,
  type VirtualNetworkEditFormValues,
  type SubnetFormValues,
} from "~/utils/validations/virtual-network";

type Props = ModalFormProps<VirtualNetworkResponse>;

export function useVirtualNetworkEditForm(props: Props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<VirtualNetworkResponse>();

  const {
    errors,
    handleSubmit,
    defineField,
    meta,
    resetForm,
    setValues,
    values,
  } = useForm<VirtualNetworkEditFormValues>({
    validationSchema: toTypedSchema(VirtualNetworkEditSchema),
    initialValues: {
      name: "",
      subnets: [],
    },
  });

  const [name, nameAttrs] = defineField("name");

  const {
    fields: subnets,
    push: pushSubnet,
    remove: removeSubnet,
  } = useFieldArray<SubnetFormValues>("subnets");

  // --- 初期化ロジック ---
  watch(
    () => [props.show, props.data] as const,
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        setValues({
          name: data.name,
          cidr: data.cidr,
          subnets: (data.subnets || []).map((s) => ({
            id: s.id,
            name: s.name,
            cidr: s.cidr,
          })),
        });
      }
    },
    { immediate: true }
  );

  function getResourceConfig(data: VirtualNetworkResponse): ResourceConfig {
    return {
      base: {
        endpoint: `virtual-networks/${data.id}`,
        fields: ["name"],
      },
      collections: {
        subnets: {
          endpoint: `virtual-networks/${data.id}/subnets`,
          bulkEndpoint: `virtual-networks/${data.id}/subnets/bulk`,
          idKey: "id",
          newIdPrefix: "new-",
          fields: ["name", "cidr"],
        },
      },
    };
  }

  // --- vee-validate の値を editedData に同期 ---
  watch(
    () => values,
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.cidr = newValues.cidr;
        editedData.value.subnets = newValues.subnets.map((subnet) => ({
          id: subnet.id,
          name: subnet.name,
          cidr: subnet.cidr,
          createdAt: "",
        }));
      }
    },
    { deep: true }
  );

  const createEmptySubnet = () => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    cidr: "",
  });

  const addSubnet = () => pushSubnet(createEmptySubnet());
  const removeSubnetHandler = (idx: number) => removeSubnet(idx);

  // --- バリデーション ---
  const validate = (): boolean => {
    return meta.value.valid;
  };

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<VirtualNetworkEditFormValues, VirtualNetworkResponse>(
      handleSubmit,
      {
        execute: async () => {
          if (!validate()) {
            return { success: false };
          }
          const success = await save();
          return { success };
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: () =>
          `仮想ネットワーク「${values.name}」を更新しました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    // State
    editedData,
    errors,
    isDirty,
    isSaving,

    // Form fields
    name,
    nameAttrs,

    // Subnet management
    subnets,
    addSubnet,
    removeSubnet: removeSubnetHandler,

    // Validation & submission
    isValid: computed(() => meta.value.valid),
    onFormSubmit,
    makehandleClose,
  };
}
