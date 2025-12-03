import { computed } from "vue";
import { useResourceList } from "@/composables/useResourceList";
import { formatDateTime } from "@/utils/date";
import { toSize } from "@/utils/format";
import { BACKUP } from "@/utils/constants";

export type BackupRow = {
  id: string;
  name: string;
  createdAtText: string;
  sizeText: string;
  description?: string;
};

/* バックアップ固有のサイズ解決ロジック（ローカルで保持） */
function resolveSize(r: BackupDTO): number | undefined {
  if (r.size != null && Number.isFinite(r.size)) return Number(r.size);
  const tvs = r.targetVirtualStorage?.size;
  if (tvs != null && Number.isFinite(tvs)) return Number(tvs);
  return undefined;
}

/**
 * useBackupManagement
 * - useResourceList を使って /api/backups を取得
 * - rawList / rows / columns / headerButtons を返してページ側で利用可能にする
 */
export function useBackupManagement() {
  const {
    data: rawList,
    pending,
    refresh,
    error,
  } = useResourceList<BackupDTO>(BACKUP.name);

  const columns = [
    { key: "name", label: "バックアップ名", align: "left" as const },
    { key: "createdAtText", label: "作成日", align: "left" as const },
    { key: "sizeText", label: "サイズ", align: "right" as const },
  ];

  const headerButtons = [{ label: "バックアップ作成", action: "add" }];

  const rows = computed<BackupRow[]>(() =>
    (rawList.value ?? []).map((r) => {
      const size = resolveSize(r);
      return {
        id: String(r.id),
        name: String(r.name ?? r.id),
        description: r.description,
        createdAtText: formatDateTime(r.createdAt),
        sizeText: size != null && Number.isFinite(size) ? toSize(size) : "—",
      };
    })
  );

  return {
    columns,
    headerButtons,
    rawList,
    rows,
    pending,
    error,
    refresh,
  } as const;
}
