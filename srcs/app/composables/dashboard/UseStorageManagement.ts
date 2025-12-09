// app/composables/dashboard/useStorageManagement.ts
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { STORAGE } from "@/utils/constants";
import {
  toSize,
  convertUnitToByte,
  BYTE_UNITS,
  type ByteUnit,
} from "@/utils/format";
import type { StoragePoolResponse } from "~~/shared/types";

const RESOURCE_NAME = STORAGE.name;

type PoolRaw = Partial<
  Pick<
    StoragePoolResponse,
    "id" | "name" | "totalSize" | "usedSize" | "hasNetworkAccess" | "node"
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

export const ADD_STORAGE_ACTION = `add-${RESOURCE_NAME}`;
export const EDIT_STORAGE_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_STORAGE_ACTION = `delete-${RESOURCE_NAME}`;

/**
 * [必須] サイズ文字列をバイト数に変換する
 * 型安全な実装で、不正な単位は安全にハンドリング
 * @param s - サイズ文字列（例: "100 GB", "1.5TB"）
 * @returns バイト数、不正な形式なら 0
 */
const parseSizeStringToBytes = (s?: string): number => {
  if (!s) return 0;

  const match = s.trim().match(/^([\d.]+)\s*([A-Z]*)$/i);
  if (!match) return 0;

  const num = parseFloat(match[1]);
  if (!isFinite(num) || num < 0) return 0;

  // [必須] ユーザー入力を大文字に変換
  const unitStr = (match[2] || "GB").toUpperCase();

  // [必須] 型安全なチェック：BYTE_UNITS に存在する単位か確認
  if (!(unitStr in BYTE_UNITS)) {
    // 不正な単位が入力された場合、ログして 0 を返す（安全な失敗！）
    console.warn(`[parseSizeStringToBytes] 不正な単位: "${unitStr}"`);
    return 0;
  }

  // [推奨] 型ガード後、安全に convert を呼び出し
  const unit = unitStr as ByteUnit;
  return convertUnitToByte(num, unit);
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

  // ノード一覧を取得して id -> name マップを作成
  const { data: nodeList } = useResourceList<{
    id: string;
    name?: string;
    hostname?: string;
  }>("nodes");

  const nodeNameMap = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (nodeList.value ?? []).forEach((node: any) => {
      const nodeId = String(node?.id ?? "");
      if (!nodeId) return;
      map[nodeId] = node?.name ?? node?.hostname ?? nodeId;
    });
    return map;
  });

  const columns = [
    { key: "name", label: "ストレージプール名", align: "left" as const },
    { key: "type", label: "タイプ", align: "left" as const },
    { key: "node", label: "ノード名", align: "left" as const },
    { key: "size", label: "サイズ", align: "right" as const },
    { key: "used", label: "使用済みデータ量", align: "right" as const },
    { key: "usage", label: "使用率", align: "right" as const },
  ];

  const headerButtons = [{ action: "add", label: "＋ストレージ追加" }];

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

      let nodeId: string | null = null;
      let nodeName = "-";
      const nodeData = (r as any).node;

      if (nodeData && typeof nodeData === "object") {
        nodeId = String(nodeData.Id ?? nodeData.id ?? "");
        nodeName = String(nodeData.Name ?? nodeData.name ?? nodeId);
      } else if (nodeData) {
        nodeId = String(nodeData);
        nodeName = nodeNameMap.value[nodeId] ?? nodeId;
      } else if ((r as any).nodeId) {
        nodeId = String((r as any).nodeId);
        nodeName = nodeNameMap.value[nodeId] ?? nodeId;
      }

      return {
        id: String((r as any).id ?? `p${Date.now()}`),
        name: (r as any).name ?? "unknown",
        type:
          (r as any).hasNetworkAccess || (r as any).type === "ネットワーク"
            ? "ネットワーク"
            : "ローカル",
        node: nodeName,
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
    ADD_STORAGE_ACTION,
    EDIT_STORAGE_ACTION,
    DELETE_STORAGE_ACTION,
  } as const;
}

export async function createPool(payload: {
  name: string;
  node: string;
  size: string;
  type?: string;
}) {
  const response = await $fetch("/api/storage-pools", {
    method: "POST",
    body: payload,
  });
  return response;
}

export async function updatePool(
  id: string,
  payload: { name?: string; node?: string; size?: string }
) {
  const response = await $fetch(`/api/storage-pools/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return response;
}
