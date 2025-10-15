const statusMap = {
  running: {
    text: "稼働中",
    class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  stopped: {
    text: "停止中",
    class: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  error: {
    text: "エラー",
    class: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  default: {
    text: "不明",
    class: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
};

/**
 * VMのステータスに応じた表示情報を取得する
 */
export const getVmStatusDisplay = (status: string) => {
  return statusMap[status as keyof typeof statusMap] || statusMap.default;
};

/**
 * VMに接続された全ストレージの合計容量をGB単位で計算する
 */
export const calculateTotalStorage = (storages: AttachedStorageDTO[]): number => {
  if (!storages || storages.length === 0) return 0;
  const totalBytes = storages.reduce(
    (sum, s) => sum + (s.storage?.size ?? 0),
    0
  );
  return convertByteToUnit(totalBytes, "GB");
};