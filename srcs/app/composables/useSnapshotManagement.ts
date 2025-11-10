// app/composables/useSnapshotManagement.ts
import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";

type RawSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  targetVirtualMachine?: { id: string; name: string };
  description?: string;
};
export type SnapshotRow = {
  id: string;
  name: string;
  vmName: string;
  createdAtText: string;
  description?: string;
};

export function useSnapshotManagement() {
  const { data, pending, error, refresh } =
    useResourceList<RawSnapshot>("snapshots");

  // ← 操作列(__actions)は入れない。DashboardLayout が row-actions スロット検知で自動追加
  const columns = [
    { key: "name", label: "スナップショット名", align: "left" as const },
    { key: "vmName", label: "対象仮想マシン", align: "left" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];
  const headerButtons = [{ label: "スナップショット作成", action: "add" }];

  const displaySnapshots = computed<SnapshotRow[]>(() =>
    (data.value || []).map((s) => ({
      id: s.id,
      name: s.name ?? "-",
      vmName: s.targetVirtualMachine?.name ?? "-",
      createdAtText: formatDateTime(s.createdAt),
      description: s.description,
    }))
  );

  return { pending, error, columns, headerButtons, displaySnapshots, refresh };
}
