/**
 * =================================================================================
 * ストレージプール追加フォーム Composable (useStorageAddForm.ts)
 * =================================================================================
 */
import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useResourceCreate } from "~/composables/useResourceCreate";
import { useResourceList } from "~/composables/useResourceList";
import { useToast } from "~/composables/useToast";
import newDevicesGet from "~~/server/api/physical-nodes/[nodeId]/new-devices.get";

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
const zodSchema = z.object({
  name: z.string().min(1, "プール名は必須です。"),
  nodeId: z
    .string({ message: "物理ノードを選択してください。" })
    .min(1, "物理ノードを選択してください。"),
  devicePath: z
    .string({ message: "デバイスパスを選択してください。" })
    .min(1, "デバイスパスを選択してください。"),
  hasNetworkAccess: z.string(),
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = z.infer<typeof zodSchema>;

/**
 * ストレージプール追加フォームのロジック
 */
export function useStorageAddForm() {
  const { addToast } = useToast();

  const { executeCreate, isCreating } = useResourceCreate<
    StoragePoolCreateRequest,
    StoragePoolResponse
  >("storage-pools");

  const {
    data: nodes,
    pending: nodesPending,
    error: nodesError,
  } = useResourceList<NodeResponse>("physical-nodes");

  // ============================================================================
  // Form Setup
  // ============================================================================
  const { errors, handleSubmit, resetForm, defineField, values } =
    useForm<FormValues>({
      validationSchema,
      initialValues: {
        name: "",
        nodeId: "",
        devicePath: "",
        hasNetworkAccess: "false", // 初期値は文字列の "false"
      },
    });

  // --- フィールド定義 ---
  const [name, nameProps] = defineField("name");
  const nameAttrs = computed(() => {
    const { name: _, ...rest } = nameProps.value;
    return rest;
  });

  const [nodeId, nodeProps] = defineField("nodeId");
  const nodeIdAttrs = computed(() => {
    const { name: _, ...rest } = nodeProps.value;
    return rest;
  });

  const [devicePath] = defineField("devicePath");

  const [hasNetworkAccess] = defineField("hasNetworkAccess");

  // ============================================================================
  // デバイスパス一覧の動的取得
  // ============================================================================
  const devices = ref<DeviceDTO[]>([]);
  const devicesPending = ref(false);
  const devicesError = ref<any>(null);

  watch(
    () => values.nodeId,
    async (newNodeId) => {
      // ノード選択が解除されたらクリア
      if (!newNodeId) {
        devices.value = [];
        devicePath.value = "";
        return;
      }

      // 念のため: newNodeId がオブジェクトになってしまっている場合のガード処理
      const targetId =
        typeof newNodeId === "object" ? (newNodeId as any).id : newNodeId;

      devicesPending.value = true;
      devicesError.value = null;
      devicePath.value = ""; // パス選択をリセット

      try {
        // $fetch はエラー時に例外を投げるため、try-catch で捕捉します
        const response = await $fetch<DeviceDTO[]>(
          `/api/physical-nodes/${targetId}/new-devices`
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

  // デバイス一覧を SelectOption[] ({id, name}) に変換する
  const deviceOptions = computed<SelectOption[]>(() => {
    return devices.value.map((d) => ({
      id: d.devicePath,
      name: d.devicePath,
    }));
  });

  // ============================================================================
  // Submission Handler
  // ============================================================================
  const onFormSubmit = (emit: (event: "success" | "close") => void) =>
    handleSubmit(async (formValues) => {
      // API送信時に型を合わせる
      const payload: StoragePoolCreateRequest = {
        name: formValues.name,
        nodeId: formValues.nodeId,
        devicePath: formValues.devicePath,
        hasNetworkAccess: formValues.hasNetworkAccess === "true",
      };

      const result = await executeCreate(payload);

      if (result.success) {
        addToast({
          type: "success",
          message: `ストレージプール「${payload.name}」を作成しました。`,
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
    nodeId,
    nodeIdAttrs,
    devicePath,
    hasNetworkAccess,
    nodes,
    nodesPending,
    nodesError,
    // 整形済みのオプションを返す
    deviceOptions,
    devicesPending,
    devicesError,
    isCreating,
    onFormSubmit,
    resetForm,
  };
}
