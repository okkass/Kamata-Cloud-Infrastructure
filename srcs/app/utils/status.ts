// ==============================================================================
// ステータスの定義と関連関数 (Status Maps and Functions)
// ==============================================================================

/** @description VMのステータス定義 */
const VmStatusMap = {
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

/** @description 物理ノードのステータス定義 */
const NodeStatusMap = {
  active: {
    text: "稼働中",
    class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  inactive: {
    text: "停止中",
    class: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  default: {
    text: "不明",
    class: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
};

/**
 * VMのステータス文字列から、UI表示用のテキストとCSSクラスを取得します。
 * @param {string} status - VMのステータス（'running'、'stopped'など）。
 * @returns {{text: string, class: string}} 表示用のテキストとTailwind CSSクラスを持つオブジェクト。
 */
export const getVmStatusDisplay = (status: string) => {
  return VmStatusMap[status as keyof typeof VmStatusMap] || VmStatusMap.default;
};

/**
 * 物理ノードのステータス文字列から、UI表示用のテキストとCSSクラスを取得します。
 * @param {string} status - ノードのステータス（'active'、'inactive'など）。
 * @returns {{text: string, class: string}} 表示用のテキストとTailwind CSSクラスを持つオブジェクト。
 */
export const getNodeStatusDisplay = (status: string) => {
  return (
    NodeStatusMap[status as keyof typeof NodeStatusMap] || NodeStatusMap.default
  );
};

// ==============================================================================
// データ計算とフォーマット (Data Calculation and Formatting)
// ==============================================================================

/**
 * VMに接続された全ストレージの合計容量を計算し、GB単位で返します。
 * @param {AttachedStorageDTO[] | undefined} storages - VMのストレージ情報の配列。未定義や空配列も安全に扱います。
 * @returns {number} 合計ストレージ容量（GB）。
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
 * @returns {string} 「4 cores / 8 GB」のようなフォーマットされた文字列、または「-」。
 */
export const formatVmSpec = (vm: VirtualMachineDTO): string => {
  let cores: number | undefined;
  let memorySize: number | undefined;

  // 型ガードを使い、VMのパターンに応じて適切なプロパティから値を取得
  if ("instanceType" in vm && vm.instanceType) {
    // パターンA: 定義済みのインスタンスタイプを持つVM
    cores = vm.instanceType.cpuCore;
    memorySize = vm.instanceType.memorySize;
  } else {
    // パターンB: CPUとメモリをカスタム指定したVM
    cores = vm.cpuCore;
    memorySize = vm.memorySize;
  }

  // 最終的な文字列をフォーマット
  if (cores === undefined || memorySize === undefined) {
    return "-"; // データが不完全な場合はハイフンを返す
  }

  const memoryGB = convertByteToUnit(memorySize, "GB");
  return `${cores} cores / ${memoryGB} GB`;
};

/** 指定された数値をパーセント表示用の文字列にフォーマットします。
 * @param {number | undefined} value - 0.0から1.0の範囲の数値。未定義の場合も考慮します。
 * @returns {string} パーセント表示用の文字列（例: "75%"）または未定義時は"—"。
 */
export const formatAsPercent = (value?: number): string => {
  return typeof value === "number" && isFinite(value)
    ? `${Math.round(value * 100)}%`
    : "—";
};
