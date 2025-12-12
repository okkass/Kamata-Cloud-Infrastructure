import { computed, ref } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { STORAGE } from "@/utils/constants";
import { toSize, type ByteUnit } from "@/utils/format";
import { formatAsPercent } from "@/utils/status";
import type { StoragePoolResponse } from "~~/shared/types";

/* =========================== Types =========================== */
export type StoragePoolRow = {
  id: string;
  name: string;
  type: "ローカル" | "ネットワーク";
  node: string;
  size: string;
  used: string;
  usage: string;
  originalData?: StoragePoolResponse; // 編集用に元のDTOを保持
};

/* =========================== Constants =========================== */
const RESOURCE_NAME = STORAGE.name;
export const ADD_STORAGE_ACTION = `add-${RESOURCE_NAME}`;
export const EDIT_STORAGE_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_STORAGE_ACTION = `delete-${RESOURCE_NAME}`;

/* =========================== Main Composable =========================== */
export function useStorageManagement() {
  // APIデータ取得
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<StoragePoolResponse>(RESOURCE_NAME);

  // ノード一覧を取得して id -> name マップを作成
  const { data: nodeList } = useResourceList<{
    id: string;
    name?: string;
    hostname?: string;
  }>("nodes");

  const nodeNameMap = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (nodeList.value ?? []).forEach(
      (node: { id: string; name?: string; hostname?: string }) => {
        const nodeId = String(node?.id ?? "");
        if (!nodeId) return;
        map[nodeId] = node?.name ?? node?.hostname ?? nodeId;
      }
    );
    return map;
  });

  const columns = [
    { key: "name", label: "ストレージプール名", align: "left" as const },
    { key: "type", label: "要素", align: "left" as const },
    { key: "node", label: "ノード名", align: "left" as const },
    { key: "size", label: "サイズ", align: "right" as const },
    { key: "used", label: "使用済みデータ量", align: "right" as const },
    { key: "usage", label: "使用率", align: "right" as const },
  ];

  const headerButtons = [{ action: "add", label: "＋ストレージ追加" }];

  // データ整形
  const rows = computed<StoragePoolRow[]>(() =>
    (rawList.value ?? []).map((r) => {
      // [必須] APIから返ってくるバイト数をそのまま使う（存在することが保証されてる！）
      const totalBytes = r.totalSize ?? 0;
      const usedBytes = r.usedSize ?? 0;

      // サイズを人間が読みやすい形に変換
      const size = toSize(totalBytes);
      const used = toSize(usedBytes);

      // [必須] 使用率を計算（format.ts の formatAsPercent を活用！）
      const ratio = totalBytes ? usedBytes / totalBytes : 0;
      const usage = formatAsPercent(ratio);

      // [必須] ノード名の抽出ロジック（nodeはオブジェクト！）
      let nodeName = "-";
      const nodeData = r.node;

      if (nodeData && typeof nodeData === "object") {
        // nodeData がオブジェクト（{ id: "...", name: "...", hostname: "..." }）
        const nodeId = String(nodeData.id ?? "");

        // 優先度順で名前を決定
        if (nodeData.name) {
          nodeName = String(nodeData.name);
        } else if ((nodeData as any).hostname) {
          nodeName = String((nodeData as any).hostname);
        } else if (nodeId) {
          // name がなければ nodeNameMap で引く（backup）
          nodeName = nodeNameMap.value[nodeId] ?? nodeId;
        }
      } else if (nodeData) {
        // nodeData が文字列（ID）の場合（念のため）
        const nodeId = String(nodeData);
        nodeName = nodeNameMap.value[nodeId] ?? nodeId;
      }

      return {
        id: String(r.id ?? `p${Date.now()}`),
        name: r.name ?? "unknown",
        // [必須] hasNetworkAccess でタイプを判定（APIが提供してくれてる！）
        type: r.hasNetworkAccess ? "ネットワーク共有" : "ローカルのみ",
        node: nodeName,
        size,
        used,
        usage,
        originalData: r,
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
