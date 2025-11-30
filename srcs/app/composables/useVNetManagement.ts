// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";

/**
 * 仮想ネットワーク DTO（プロジェクト共通型が使えない場合のフォールバック）
 */
export type VirtualNetworkDTO = {
  id: string;
  name?: string | null;
  cidr?: string | null;
  subnets?: Array<{ id?: string; cidr?: string; [k: string]: any }>;
  createdAt?: string | null;
  description?: string | null;
  inboundTraffic?: number | null;
  outboundTraffic?: number | null;
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

function countSubnets(v: VirtualNetworkDTO | any): number {
  return Array.isArray(v?.subnets) ? v.subnets.length : 0;
}

/**
 * useVNetManagement
 * - useResourceList("virtual-networks") を利用して一覧を取得
 * - useUserManagement と同様の戻り値形に合わせる（columns/headerButtons/rows/refresh 等）
 */
export function useVNetManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<VirtualNetworkDTO>("virtual-networks");

  const columns = [
    { key: "name", label: "名前", align: "left" },
    { key: "cidr", label: "CIDR", align: "left" },
    { key: "subnets", label: "サブネット数", align: "right" },
    { key: "createdAtText", label: "作成日時", align: "left" },
  ];

  const headerButtons = [{ action: "add", label: "仮想ネットワーク作成" }];

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
  } as const;
}
