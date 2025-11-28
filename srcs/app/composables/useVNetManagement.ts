// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed, ref } from "vue";
import { formatDateTime } from "@/utils/date";

export type VNetRow = {
  id: string;
  name: string;
  cidr: string;
  subnets: number;
  createdAtText: string;
  description?: string;
  inboundTraffic?: number;
  outboundTraffic?: number;
};
export function useVNetManagement() {
  const { data, pending, error, refresh } = useResourceList<VirtualNetworkDTO>(
    NETWORK.name
  );
  const CREATE_VNET_ACTION = `create-${NETWORK.name}`;
  const DELETE_VNET_ACTION = `delete-${NETWORK.name}`;
  const EDIT_VNET_ACTION = `edit-${NETWORK.name}`;

  const columns: TableColumn[] = [
    { key: "name", label: "名前", align: "left" },
    { key: "cidr", label: "CIDR", align: "left" },
    { key: "subnets", label: "サブネット数", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  const headerButtons = [
    { action: CREATE_VNET_ACTION, label: "仮想ネットワーク作成" },
  ];

  const rows = computed<VNetRow[]>(() =>
    (data.value ?? []).map((v) => {
      const subnetsCount = Array.isArray(v.subnets) ? v.subnets.length : 0;
      return {
        id: v.id,
        name: v.name,
        cidr: v.cidr,
        subnets: subnetsCount,
        createdAtText: v.createdAt ? formatDateTime(v.createdAt) : "-",
        inboundTraffic: v.inboundTraffic,
        outboundTraffic: v.outboundTraffic,
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
    CREATE_VNET_ACTION,
    DELETE_VNET_ACTION,
    EDIT_VNET_ACTION,
  } as const;
}
