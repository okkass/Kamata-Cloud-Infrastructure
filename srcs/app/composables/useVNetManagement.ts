// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed, ref } from "vue";
import { formatDateTime } from "@/utils/date";

type RawVNet = {
  id: string;
  name: string;
  cidr: string;
  // API では subnets が配列（オブジェクト配列）で返る想定
  subnets?: Array<Record<string, any>>;
  createdAt?: string; // ISO
  description?: string;
  inboundTraffic?: number;
  outboundTraffic?: number;
};

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

const DEFAULT_MOCK: RawVNet[] = [
  {
    id: "vnet-1",
    name: "default-vnet",
    cidr: "10.0.0.0/16",
    subnets: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
    createdAt: new Date().toISOString(),
    description: "デフォルトの仮想ネットワーク（モック）",
  },
  {
    id: "vnet-2",
    name: "prod-vnet",
    cidr: "192.168.0.0/16",
    subnets: [{ id: "s1" }, { id: "s2" }],
    createdAt: new Date().toISOString(),
    description: "本番用（モック）",
  },
];

export function useVNetManagement() {
  const { data, pending, error, refresh } = useAsyncData<RawVNet[]>(
    "virtual-networks:list",
    () => $fetch("/api/virtual-networks")
  );

  const columns = [
    { key: "name", label: "名前", align: "left" as const },
    { key: "cidr", label: "CIDR", align: "left" as const },
    { key: "subnets", label: "サブネット数", align: "right" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];

  const headerButtons = [
    { action: "create", label: "仮想ネットワーク作成", variant: "primary" },
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
        description: v.description,
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
  } as const;
}
