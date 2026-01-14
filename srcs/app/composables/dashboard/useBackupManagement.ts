import { computed, onMounted, onUnmounted } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { useUserPermission } from "@/composables/useUserPermission";
import { formatDateTime } from "@/utils/date";
import { toSize } from "@/utils/format";
import { BACKUP } from "@/utils/constants";
import { createPolling } from "@/utils/polling";

export type BackupRow = {
  id: string;
  name: string;
  createdAt?: string;
  createdAtText: string;
  sizeText: string;
  description?: string;
  originalData?: BackupResponse;
  ownerName: string;
};

/* バックアップ固有のサイズ解決ロジック（ローカルで保持） */
function resolveSize(r: BackupResponse): number | undefined {
  if (r.size != null && Number.isFinite(r.size)) return Number(r.size);
  const ts = r.targetStorage?.size;
  if (ts != null && Number.isFinite(ts)) return Number(ts);
  return undefined;
}

/**
 * useBackupManagement
 * - useResourceList を使って /api/backups を取得
 * - rawList / rows / columns / headerButtons を返してページ側で利用可能にする
 */
export function useBackupManagement() {
  const { fetchUser, isAdmin } = useUserPermission();
  void fetchUser();

  const isManager = computed(() => isAdmin.value === true);

  const tableTitle = computed(() => {
    return isManager.value
      ? "バックアップ・復元管理（全ユーザー）"
      : "バックアップ・復元管理";
  });

  const queryOptions = computed(() => {
    return isManager.value ? { scope: "all" } : undefined;
  });

  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<BackupResponse>(BACKUP.name, queryOptions);

  // --- ポーリング設定 ---
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
    { key: "name", label: "バックアップ名", align: "left" as const },
    { key: "ownerName", label: "所有者", align: "left" as const },
    { key: "createdAtText", label: "作成日", align: "left" as const },
    { key: "sizeText", label: "サイズ", align: "right" as const },
  ];

  const headerButtons = [{ label: "バックアップ作成", action: "add" }];

  const ADD_BACKUP_ACTION = `add-${BACKUP.name}`;
  const DELETE_BACKUP_ACTION = `delete-${BACKUP.name}`;
  const RESTORE_BACKUP_ACTION = `restore-${BACKUP.name}`;

  const rows = computed<BackupRow[]>(() =>
    (rawList.value ?? []).map((r) => {
      const size = resolveSize(r);
      return {
        id: String(r.id),
        name: String(r.name ?? r.id),
        description: r.description,
        ownerName: r.owner?.name ?? "-",
        createdAt: r.createdAt,
        createdAtText: formatDateTime(r.createdAt),
        sizeText: size != null && Number.isFinite(size) ? toSize(size) : "—",
        originalData: r,
      };
    })
  );

  return {
    columns,
    headerButtons,
    rows,
    pending,
    error,
    refresh,
    lastUpdatedTime,
    startPolling,
    stopPolling,
    ADD_BACKUP_ACTION,
    DELETE_BACKUP_ACTION,
    RESTORE_BACKUP_ACTION,
    tableTitle,
  } as const;
}
