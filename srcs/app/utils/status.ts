/**
 * @constant statusMap
 * @description VMのステータス文字列に対応する表示テキストとCSSクラスを定義したマッピングオブジェクト。
 */
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
  // 'pending' などの新しいステータスもここに追加できる
  default: {
    text: "不明",
    class: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
};

/**
 * VMのステータス文字列から、UI表示用のテキストとCSSクラスを取得します。
 * @param {string} status - 'running', 'stopped' などのVMステータス。
 * @returns {{text: string, class: string}} - 表示用のテキストとTailwind CSSクラスを持つオブジェクト。
 */
export const getVmStatusDisplay = (status: string) => {
  return statusMap[status as keyof typeof statusMap] || statusMap.default;
};

/**
 * VMに接続された全ストレージの合計容量を計算し、GB単位で返します。
 * @param {AttachedStorageDTO[]} [storages] - VMのストレージ情報の配列。未定義や空配列も安全に扱います。
 * @returns {number} - 合計ストレージ容量（GB）。
 */
export const calculateTotalStorage = (
  storages?: AttachedStorageDTO[]
): number => {
  if (!storages || storages.length === 0) {
    return 0;
  }
  const totalBytes = storages.reduce(
    (sum, s) => sum + (s.storage?.size ?? 0),
    0
  );
  return convertByteToUnit(totalBytes, "GB");
};

/**
 * VMオブジェクトからスペック情報（CPUコア数とメモリ）を整形した文字列を生成します。
 * 'instanceType' を持つパターンとカスタムスペックを持つパターンの両方に対応します。
 * @param {VirtualMachineDTO} vm - 仮想マシンデータオブジェクト。
 * @returns {string} - "4 cores / 8 GB" のようなフォーマットされた文字列。
 */
export const formatVmSpec = (vm: VirtualMachineDTO): string => {
  let cores: number | undefined;
  let memorySize: number | undefined;

  // 型ガードを使い、VMのパターンに応じて適切なプロパティから値を取得
  if ("instanceType" in vm && vm.instanceType) {
    // パターンA: instanceType を持つVM
    cores = vm.instanceType.cpuCores; // ✨ 'cpuCore' から 'cpuCores' (複数形) に修正
    memorySize = vm.instanceType.memorySize;
  } else {
    // パターンB: カスタムスペックを持つVM
    cores = vm.cpuCores;
    memorySize = vm.memorySize;
  }

  // 共通のフォーマット処理
  if (!cores || !memorySize) {
    return "-"; // データが不完全な場合はハイフンを返す
  }

  const memoryGB = convertByteToUnit(memorySize, "GB");
  return `${cores} cores / ${memoryGB} GB`;
};
