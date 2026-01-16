// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useUserPermission } from "@/composables/useUserPermission";
import { NETWORK } from "@/utils/constants";
import { formatDateTime } from "@/utils/date";
import { createPolling } from "@/utils/polling";
import type { VirtualNetworkResponse } from "~~/shared/types";

export type VnetRow = {
  id: string;
  name: string;
  cidr: string;
  subnets: number;
  ownerName: string;
  createdAtText: string;
  originalData: VirtualNetworkResponse;
};

const RESOURCE_NAME = NETWORK.name;
export const CREATE_VNET_ACTION = `create-${RESOURCE_NAME}`;
export const EDIT_VNET_ACTION = `edit-${RESOURCE_NAME}`;
export const DELETE_VNET_ACTION = `delete-${RESOURCE_NAME}`;

/**
 * useVNetManagement
 */
export function useVNetManagement() {
  // --- Permissions ---
  const { fetchUser, isNetworkAdmin } = useUserPermission();
  void fetchUser();

  const tableTitle = computed(() => {
    return isNetworkAdmin.value
      ? "仮想ネットワーク（全ユーザー）"
      : "仮想ネットワーク";
  });

  const queryOptions = computed(() => {
    return isNetworkAdmin.value ? { scope: "all" } : undefined;
  });

  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<VirtualNetworkResponse>(RESOURCE_NAME, queryOptions);

  const { startPolling, stopPolling, runOnce, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
    }
  );

  // マウント時に即時実行し、その後ポーリング開始。アンマウント時に停止。
  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  const columns = [
    { key: "name", label: "名前", align: "left" as const },
    { key: "cidr", label: "CIDR", align: "left" as const },
    { key: "subnets", label: "サブネット数", align: "right" as const },
    { key: "ownerName", label: "所有者", align: "left" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];

  const headerButtons = [
    { action: "add", label: "仮想ネットワーク作成", primary: true },
  ];

  const rows = computed<VnetRow[]>(() =>
    (rawList.value ?? []).map((v: VirtualNetworkResponse) => ({
      id: v.id,
      name: v.name ?? "-",
      cidr: v.cidr ?? "-",
      subnets: Array.isArray(v.subnets) ? v.subnets.length : 0,
      ownerName: v.owner?.name ?? "-",
      createdAtText: v.createdAt ? formatDateTime(v.createdAt) : "-",
      originalData: v,
    }))
  );

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    tableTitle,
    CREATE_VNET_ACTION,
    EDIT_VNET_ACTION,
    DELETE_VNET_ACTION,
  } as const;
}
