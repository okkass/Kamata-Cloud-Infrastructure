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
} from "~/utils/validations/virtual-network";

interface Props {
  show: boolean;
  virtualNetworkData: VirtualNetworkResponse | null;
}

export function useVirtualNetworkEditForm(props: Props) {
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { editedData, init, save, isDirty, isSaving } =
    useResourceUpdater<VirtualNetworkResponse>();

  const { errors, handleSubmit, defineField, meta, resetForm, setValues } =
    useForm<VirtualNetworkEditFormValues>({
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
  } = useFieldArray("subnets");

  // --- 初期化ロジック ---
  watch(
    () => [props.show, props.virtualNetworkData] as const,
    ([show, data]) => {
      if (show && data) {
        init(data, getResourceConfig(data));
        setValues({
          name: data.name,
          subnets: data.subnets || [],
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
    () => ({ name: name.value, subnets: subnets.value }),
    (newValues) => {
      if (editedData.value) {
        editedData.value.name = newValues.name;
        editedData.value.subnets = newValues.subnets;
      }
    },
    { deep: true }
  );

  const createEmptySubnet = () => ({
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    cidr: "",
    createdAt: new Date().toISOString(),
  });

  const addSubnet = () => pushSubnet(createEmptySubnet());
  const removeSubnetHandler = (idx: number) => removeSubnet(idx);

  // --- 送信ハンドラ ---
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<FormValues, VirtualNetworkResponse>(
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
          `仮想ネットワーク「${name.value}」を更新しました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    subnets,
    addSubnet,
    removeSubnet: removeSubnetHandler,
    isDirty,
    isValid: computed(() => meta.value.valid),
    isSaving,
    onFormSubmit,
    makehandleClose,
  };
}
