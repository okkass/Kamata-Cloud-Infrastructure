import { ref } from "vue";

type RawBackup = {
  id: string;
  name: string;
  createdAt?: string;
  // API 側で来る可能性のあるフィールドをすべて許容するにゃん
  size?: number;
  sizeBytes?: number;
  targetVirtualStorage?: { size?: number };
  description?: string;
};

export type BackupRow = {
  id: string;
  name: string;
  createdAtText: string;
  sizeText: string;
  description?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}/${m}/${day} ${hh}:${mm}`;
}
function trimNum(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function toReadableSize(bytes?: number) {
  if (bytes == null || Number.isNaN(bytes)) return "-";
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return `${trimNum(bytes / GB)}GB`;
  if (bytes >= MB) return `${trimNum(bytes / MB)}MB`;
  if (bytes >= KB) return `${trimNum(bytes / KB)}KB`;
  return `${bytes}B`;
}

/* 助手: API レスポンスから実サイズを安全に取得するにゃん */
function resolveSize(r: RawBackup): number | undefined {
  // 優先順: size -> sizeBytes -> targetVirtualStorage.size
  if (r.size != null && Number.isFinite(r.size)) return Number(r.size);
  if (r.sizeBytes != null && Number.isFinite(r.sizeBytes))
    return Number(r.sizeBytes);
  const tvs = r.targetVirtualStorage?.size;
  if (tvs != null && Number.isFinite(tvs)) return Number(tvs);
  return undefined;
}

/**
 * useBackupManagement
 * - /api/backups を参照して表示用データを返すにゃん
 * - API が無ければ空配列でフォールバックするにゃん
 */
export function useBackupManagement() {
  const columns = ref([
    { key: "name", label: "バックアップ名", align: "left" },
    { key: "createdAtText", label: "作成日", align: "left" },
    { key: "sizeText", label: "サイズ", align: "right" },
  ]);

  const headerButtons = ref([
    { key: "create", label: "バックアップ作成", primary: true },
  ]);

  const rows = ref<BackupRow[]>([]);

  async function refresh() {
    try {
      const fetchFn =
        (globalThis as any).$fetch ??
        (async (url: string) => {
          const r = await fetch(url);
          if (!r.ok) throw new Error(`fetch ${url} failed`);
          return r.json();
        });

      const raw: RawBackup[] = await fetchFn("/api/backups");
      if (!Array.isArray(raw)) {
        rows.value = [];
        return;
      }
      rows.value = raw.map((r) => {
        const size = resolveSize(r);
        return {
          id: String(r.id),
          name: String(r.name),
          description: r.description,
          createdAtText: formatDateTime(r.createdAt),
          sizeText: toReadableSize(size),
        };
      });
    } catch (e) {
      // フォールバック: 空配列（上位で mock を使いたければ refresh をオーバーライドするにゃん）
      console.warn(
        "useBackupManagement.refresh failed, fallback to empty list",
        e
      );
      rows.value = [];
    }
  }

  // 初期取得（任意でページ側から再取得可能）
  void refresh();

  return {
    columns,
    headerButtons,
    rows,
    refresh,
  };
}
