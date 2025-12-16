import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useResourceCreate } from "@/composables/useResourceCreate";
import { useResourceUpdate } from "@/composables/useResourceEdit";
import { STORAGE } from "@/utils/constants";
import { toSize } from "@/utils/format";
import { formatAsPercent } from "@/utils/status";
import type {
  StoragePoolResponse,
  StoragePoolCreateRequest,
  StoragePoolPatchRequest,
  NodeResponse,
} from "~~/shared/types";

export type StoragePoolRow = {
  id: string;
  name: string;
  type: "ネットワーク共有" | "ローカルのみ";
  node: string;
  size: string;
  used: string;
  usage: string;
  originalData?: StoragePoolResponse;
};


const extractNodeName = (
  nodeData: NodeResponse | string | null | undefined
): string => {
  if (!nodeData) return "-";
  if (typeof nodeData === "object" && "name" in nodeData) {
    return nodeData.name || nodeData.id || "-";
  }
  return String(nodeData);
};

export function useStorageManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<StoragePoolResponse>(STORAGE.name);

  const columns = [
    { key: "name", label: "ストレージプール名", align: "left" as const },
    { key: "type", label: "要素", align: "left" as const },
    { key: "node", label: "ノード名", align: "left" as const },
    { key: "size", label: "サイズ", align: "right" as const },
    { key: "used", label: "使用済みデータ量", align: "right" as const },
    { key: "usage", label: "使用率", align: "right" as const },
  ];

  const headerButtons = [{ action: "add", label: "＋ストレージ追加" }];

  const rows = computed<StoragePoolRow[]>(() =>
    (rawList.value ?? []).map((r) => {
      const totalBytes = r.totalSize ?? 0;
      const usedBytes = r.usedSize ?? 0;
      const ratio = totalBytes ? usedBytes / totalBytes : 0;

      return {
        id: String(r.id ?? `p${Date.now()}`),
        name: r.name ?? "unknown",
        type: r.hasNetworkAccess ? "ネットワーク共有" : "ローカルのみ",
        node: extractNodeName(r.node),
        size: toSize(totalBytes),
        used: toSize(usedBytes),
        usage: formatAsPercent(ratio),
        originalData: r,
      };
    })
  );

  const { executeCreate, isCreating } = useResourceCreate<
    StoragePoolCreateRequest,
    StoragePoolResponse
  >(STORAGE.name);

  const { executeUpdate, isUpdating } = useResourceUpdate<
    StoragePoolPatchRequest,
    StoragePoolResponse
  >(STORAGE.name);

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
    createPool: executeCreate,
    updatePool: executeUpdate,
    isCreating,
    isUpdating,
  } as const;
}
