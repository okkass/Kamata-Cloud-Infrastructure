// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";

/* action 定数を composable 側で定義・export（instance-type と同様のパターン） */
export const CREATE_VNET_ACTION = "create-virtual-network";
export const EDIT_VNET_ACTION = "edit-virtual-network";
export const DELETE_VNET_ACTION = "delete-virtual-network";

/* ページ実装で期待されている名前でのエイリアスを追加（互換性確保） */
export const CREATE_NETWORK_ACTION = CREATE_VNET_ACTION;
export const EDIT_NETWORK_ACTION = EDIT_VNET_ACTION;
export const DELETE_NETWORK_ACTION = DELETE_VNET_ACTION;

export type VirtualNetworkDTO = {
  id: string;
  name?: string | null;
  cidr?: string | null;
  subnets?: Array<{ id?: string; cidr?: string; [k: string]: any }>;
  createdAt?: string | null;
  description?: string | null;
  [k: string]: any;
};

export type VNetRow = {
  id: string;
  name: string;
  cidr: string;
  subnets: number;
  createdAtText: string;
  description?: string;
  dto?: VirtualNetworkDTO;
};

function countSubnets(v: VirtualNetworkDTO): number {
  return Array.isArray(v?.subnets) ? v.subnets.length : 0;
}

export function useVNetManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<VirtualNetworkDTO>("virtual-networks");

  const columns: TableColumn[] = [
    { key: "name", label: "名前", align: "left" },
    { key: "cidr", label: "CIDR", align: "left" },
    { key: "subnets", label: "サブネット数", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  /* DashboardLayout が emit する action と合わせるため "add" を使う */
  const headerButtons = [
    { action: "add", label: "仮想ネットワーク作成", primary: true },
  ];

  const rows = computed<VNetRow[]>(() =>
    (rawList.value ?? []).map((v) => ({
      id: v.id,
      name: v.name ?? "-",
      cidr: v.cidr ?? "-",
      subnets: countSubnets(v),
      createdAtText: v.createdAt ? formatDateTime(v.createdAt) : "-",
      description: v.description ?? undefined,
      dto: v,
    }))
  );

  return {
    pending,
    error,
    columns,
    headerButtons,
    rows,
    refresh,
    CREATE_NETWORK_ACTION,
    EDIT_NETWORK_ACTION,
    DELETE_NETWORK_ACTION,
  } as const;
}
