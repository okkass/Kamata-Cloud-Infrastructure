// app/composables/useSnapshotManagement.ts
import { computed, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";
import { createPolling } from "@/utils/polling";

export type SnapshotRow = {
  id: string;
  name: string;
  vmName: string;
  createdAtText: string;
  description?: string;
  originalData?: SnapshotResponse;
};
export const createSnapshotAction = `create-${SNAPSHOT.name}`;
export const restoreSnapshotAction = `restore-${SNAPSHOT.name}`;
export const deleteSnapshotAction = `delete-${SNAPSHOT.name}`;

export function useSnapshotManagement() {
  const { data, pending, error, refresh } = useResourceList<SnapshotResponse>(
    SNAPSHOT.name
  );

  const columns = [
    { key: "name", label: "スナップショット名", align: "left" as const },
    { key: "vmName", label: "対象仮想マシン", align: "left" as const },
    { key: "createdAtText", label: "作成日時", align: "left" as const },
  ];
  const headerButtons = [{ label: "作成", action: "create" }];

  const displaySnapshots = computed<SnapshotRow[]>(() =>
    (data.value || []).map((s) => ({
      id: s.id,
      name: s.name ?? "-",
      vmName: s.targetVirtualMachine?.name ?? "-",
      createdAtText: formatDateTime(s.createdAt),
      description: s.description,
      originalData: s,
    }))
  );

  // 共通ポーリングユーティリティでのポーリング
  const { startPolling, runOnce, stopPolling, lastUpdatedTime } = createPolling(
    () => {
      return Promise.resolve(refresh());
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
    refresh,
    startPolling,
    stopPolling,
    lastUpdatedTime,
    CREATE_SNAPSHOT_ACTION: createSnapshotAction,
    RESTORE_SNAPSHOT_ACTION: restoreSnapshotAction,
    DELETE_SNAPSHOT_ACTION: deleteSnapshotAction,
  };
}
