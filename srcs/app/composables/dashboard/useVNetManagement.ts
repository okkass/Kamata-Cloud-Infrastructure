// 仮想ネットワーク用の簡易 composable（ページ単体で動くように最小実装）
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";
import type { VirtualNetworkDTO } from "~~/shared/types/dto/virtual-network";

/**
 * useVNetManagement
 * - DTO は共有型を使う（ページで DTO を再定義しない）
 * - 行型はページ側で定義するためここでは any を返す形にしている
 */
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

  // DashboardLayout 側が emit する値と揃える ("add")
  const headerButtons = [
    { action: "add", label: "仮想ネットワーク作成", primary: true },
  ];

  const rows = computed(() =>
    (rawList.value ?? []).map((v: VirtualNetworkDTO) => ({
      id: v.id,
      name: v.name ?? "-",
      cidr: v.cidr ?? "-",
      subnets: Array.isArray(v.subnets) ? v.subnets.length : 0,
      createdAtText: v.createdAt ? formatDateTime(v.createdAt) : "-",
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
