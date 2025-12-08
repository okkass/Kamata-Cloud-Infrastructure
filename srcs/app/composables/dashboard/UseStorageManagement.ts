// app/composables/dashboard/useStorageManagement.ts
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import type { StoragePoolResponse } from "~~/shared/types/dto/storage-pool";
import { toSize, convertUnitToByte } from "@/utils/format";
import { STORAGE } from "@/utils/constants";

type PoolRaw = Partial<
  Pick<
    StoragePoolResponse,
    "id" | "name" | "nodeId" | "totalSize" | "usedSize" | "hasNetworkAccess"
  > & { type?: string; node?: string; size?: string; used?: string }
>;

export type StorageRow = {
  id: string;
  name: string;
  type: "ローカル" | "ネットワーク";
  node: string;
  size: string;
  used: string;
  usage: string;
  originalData?: StoragePoolResponse | PoolRaw;
};

const RESOURCE_NAME = STORAGE?.name ?? "storage-pools";

// スナップショットと同じようにアクション文字列をここで定義
export const ADD_STORAGE_ACTION = `add-${RESOURCE_NAME}`;
export const EDIT_STORAGE_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_STORAGE_ACTION = `delete-${RESOURCE_NAME}`;

const parseSizeStringToBytes = (s?: string): number => {
  if (!s) return 0;
  const m = String(s)
    .trim()
    .toUpperCase()
    .match(/^([\d.]+)\s*(TB|GB|MB|KB|B)?$/);
  if (!m) return 0;
  const v = parseFloat(m[1]) || 0;
  const unit = (m[2] ?? "GB") as "TB" | "GB" | "MB" | "KB" | "B";
  return convertUnitToByte(v, unit as any);
};

const calcUsage = (total: number, used: number) =>
  total ? `${Math.round((used / total) * 100)}%` : "0%";

export function useStorageManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<StoragePoolResponse | PoolRaw>(RESOURCE_NAME);

  const columns: TableColumn[] = [
    { key: "name", label: "ストレージプール名", align: "left" },
    { key: "type", label: "タイプ", align: "left" },
    { key: "node", label: "ノード", align: "left" },
    { key: "size", label: "サイズ", align: "right" },
    { key: "used", label: "使用済みデータ量", align: "right" },
    { key: "usage", label: "使用率", align: "right" },
  ];

  const headerButtons = [
    { action: "add-local", label: "＋ ローカルストレージ追加" },
    { action: "add-network", label: "＋ ネットワークストレージ追加" },
  ];

  const rows = computed<StorageRow[]>(() =>
    (rawList.value ?? []).map((r) => {
      const totalBytes =
        typeof (r as any).totalSize === "number"
          ? (r as any).totalSize
          : parseSizeStringToBytes((r as any).size);
      const usedBytes =
        typeof (r as any).usedSize === "number"
          ? (r as any).usedSize
          : parseSizeStringToBytes((r as any).used);

      const size = toSize(totalBytes ?? 0);
      const used = toSize(usedBytes ?? 0);
      const usage = calcUsage(totalBytes ?? 0, usedBytes ?? 0);

      return {
        id: String((r as any).id ?? `p${Date.now()}`),
        name: (r as any).name ?? "unknown",
        type:
          (r as any).hasNetworkAccess || (r as any).type === "ネットワーク"
            ? "ネットワーク"
            : "ローカル",
        node: (r as any).node ?? (r as any).nodeId ?? "-",
        size,
        used,
        usage,
        originalData: r as StoragePoolResponse | PoolRaw,
      };
    })
  );

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
  } as const;
}

export async function createPool(payload: {
  name: string;
  node: string;
  size: string;
  type?: string;
}) {
  const totalSize = parseSizeStringToBytes(payload.size);
  await fetch("/api/storage-pools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      nodeId: payload.node,
      totalSize: totalSize || undefined,
      usedSize: 0,
      hasNetworkAccess:
        payload.type === "ネットワーク" || payload.type === "network",
    }),
  }).catch(() => {});
}

export async function updatePool(
  id: string,
  payload: { name?: string; node?: string; size?: string }
) {
  const body: Record<string, unknown> = {};
  if (payload.name) body.name = payload.name;
  if (payload.node) body.nodeId = payload.node;
  if (payload.size) body.totalSize = parseSizeStringToBytes(payload.size);

  await fetch(`/api/storage-pools/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
