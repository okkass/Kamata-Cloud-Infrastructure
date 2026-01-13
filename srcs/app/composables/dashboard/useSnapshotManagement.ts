// app/composables/useSnapshotManagement.ts
import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useUserPermission } from "@/composables/useUserPermission";
import { formatDateTime } from "@/utils/date";
import { createPolling } from "@/utils/polling";
import { SNAPSHOT } from "@/utils/constants";
import type { SnapshotResponse } from "~~/shared/types";

export type SnapshotRow = {
  id: string;
  name: string;
  vmName: string;
  createdAtText: string;
  description?: string;
  originalData?: SnapshotResponse;
  ownerName: string;
};
export const createSnapshotAction = `create-${SNAPSHOT.name}`;
export const restoreSnapshotAction = `restore-${SNAPSHOT.name}`;
export const deleteSnapshotAction = `delete-${SNAPSHOT.name}`;

export function useSnapshotManagement() {
  // --- Permissions ---
  const { fetchUser, isAdmin, isVirtualMachineAdmin } = useUserPermission();
  void fetchUser();

  const isManager = computed(
    () => isAdmin.value === true || isVirtualMachineAdmin.value === true
  );

  // --- API Data ---
  const { data, pending, error, refresh } = useResourceList<SnapshotResponse>(
    SNAPSHOT.name
  );

  // 管理者の場合は全リソースを取得
  const { data: allData, refresh: refreshAll } =
    useResourceList<SnapshotResponse>(
      SNAPSHOT.name,
      computed(() => (isManager.value ? { scope: "all" } : undefined))
    );

  const columns = [
    { key: "name", label: "スナップショット名", align: "left" as const },
    { key: "ownerName", label: "所有者", align: "left" as const },
    { key: "vmName", label: "対象仮想マシン", align: "left" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];
  const headerButtons = [{ label: "作成", action: "create" }];

  const formatSnapshot = (s: SnapshotResponse): SnapshotRow => ({
    id: s.id,
    name: s.name ?? "-",
    vmName: s.targetVirtualMachine?.name ?? "-",
    createdAtText: formatDateTime(s.createdAt),
    description: s.description,
    ownerName: s.owner?.name ?? "-",
    originalData: s,
  });

  const displaySnapshots = computed<SnapshotRow[]>(() =>
    (data.value || []).map(formatSnapshot)
  );

  const allDisplaySnapshots = computed<SnapshotRow[]>(() => {
    if (!isManager.value) return [];
    return (allData.value || []).map(formatSnapshot);
  });

  // 共通ポーリングユーティリティでのポーリング
  const { startPolling, runOnce, stopPolling, lastUpdatedTime } = createPolling(
    async () => {
      await refresh();
      if (isManager.value) {
        await refreshAll();
      }
    },
    3000
  );
  onMounted(() => {
    void runOnce();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });
  return {
    pending,
    error,
    columns,
    headerButtons,
    displaySnapshots,
    allDisplaySnapshots,
    isManager,
    refresh,
    refreshAll,
    startPolling,
    stopPolling,
    lastUpdatedTime,
    CREATE_SNAPSHOT_ACTION: createSnapshotAction,
    RESTORE_SNAPSHOT_ACTION: restoreSnapshotAction,
    DELETE_SNAPSHOT_ACTION: deleteSnapshotAction,
  };
}
