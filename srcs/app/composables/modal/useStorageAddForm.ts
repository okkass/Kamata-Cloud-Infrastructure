/**
 * =================================================================================
 * ストレージプール追加フォーム Composable (useStorageAddForm.ts)
 * =================================================================================
 */
import { computed, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useApiClient } from "~/composables/useResourceClient";
import { useFormAction } from "~/composables/modal/useModalAction";
import {
  StorageAddSchema,
  type StorageAddFormValues,
} from "~/utils/validations/storage";

// デバイス情報の型 (APIレスポンス)
interface DeviceDTO {
  devicePath: string;
}

// Selectコンポーネントが要求する型
interface SelectOption {
  id: string;
  name: string;
}

// ==============================================================================
// Validation Schema
// ==============================================================================
const validationSchema = toTypedSchema(StorageAddSchema);
type FormValues = StorageAddFormValues;

/**
 * ストレージプール追加フォームのロジック
 */
export function useStorageAddForm() {
  const api = useApiClient();
  const { handleFormSubmit, makeHandleClose } = useFormAction();

  const { executeCreate, isCreating } = useResourceCreate<
    StoragePoolCreateRequest,
    StoragePoolResponse
  >(STORAGE.name);

  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError,
  } = useResourceList<NodeResponse>(NODE.name);

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm, defineField, values, meta } =
    useForm<FormValues>({
      validationSchema,
      initialValues: {
        name: "",
        nodeId: "",
        devicePath: "",
        hasNetworkAccess: "false",
      },
    });

  // --- フィールド定義 ---
  const [name, nameAttrs] = defineField("name");

  const [nodeId, nodeAttrs] = defineField("nodeId");

  const [devicePath, devicePathAttrs] = defineField("devicePath");

  const [hasNetworkAccess, hasNetworkAccessAttrs] = defineField("hasNetworkAccess");

  // ============================================================================
  // デバイスパス一覧の動的取得
  // ============================================================================
  const devices = ref<DeviceDTO[]>([]);
  const devicesPending = ref(false);
  const devicesError = ref<any>(null);

  watch(
    () => values.nodeId,
    async (newNodeId) => {
      if (!newNodeId) {
        devices.value = [];
        return;
      }

      const targetId =
        typeof newNodeId === "object" ? (newNodeId as any).id : newNodeId;

      devicesPending.value = true;
      devicesError.value = null;

      try {
        const response = await api.get<DeviceDTO[]>(
          `${NODE.name}/${targetId}/new-devices`
        );
        devices.value = response || [];
      } catch (err) {
        console.error("デバイス一覧取得エラー:", err);
        devicesError.value = err;
        devices.value = [];
      } finally {
        devicesPending.value = false;
      }
    }
  );

  const deviceOptions = computed<SelectOption[]>(() => {
    return devices.value.map((d) => ({
      id: d.devicePath,
      name: d.devicePath,
    }));
  });

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: any) =>
    handleFormSubmit<FormValues, StoragePoolResponse>(
      handleSubmit,
      {
        execute: async (formValues) => {
          const payload: StoragePoolCreateRequest = {
            name: formValues.name,
            nodeId: formValues.nodeId,
            devicePath: formValues.devicePath,
            hasNetworkAccess: formValues.hasNetworkAccess === "true",
          };
          return await executeCreate(payload);
        },
        onSuccess: () => {
          resetForm();
        },
        onSuccessMessage: (payload) =>
          `ストレージプール「${payload.name}」を作成しました。`,
      },
      emit
    );

  const makehandleClose = (emit: any) => makeHandleClose(resetForm, emit);

  return {
    errors,
    name,
    nameAttrs,
    nodeId,
    nodeAttrs,
    devicePath,
    devicePathAttrs,
    hasNetworkAccess,
    hasNetworkAccessAttrs,
    nodes,
    nodesPending,
    nodesError,
    deviceOptions,
    devicesPending,
    devicesError,
    isValid: computed(() => meta.value.valid),
    isCreating,
    onFormSubmit,
    makehandleClose,
  };
}
