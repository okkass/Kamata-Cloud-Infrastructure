export const BYTE_UNITS = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
} as const;

export type ByteUnit = keyof typeof BYTE_UNITS;

/**
 * バイトを指定された単位に変換し、最も近い整数に丸める
 * @param bytes - 変換元のバイト数(nullまたはundefinedも許容)
 * @param unit - 変換先の単位
 * @param round - 結果を丸めるかどうか（デフォルトはtrue）
 * @returns {number} - 変換後の数値
 */
export const convertByteToUnit = (
  bytes: number | null | undefined,
  unit: ByteUnit,
  round: boolean = true
): number => {
  if (bytes == null || isNaN(bytes)) {
    return 0;
  }
  return round
    ? Math.round(bytes / BYTE_UNITS[unit])
    : bytes / BYTE_UNITS[unit];
};

/**
 * 指定された単位の値をバイトに変換する
 * @param value - 変換元の数値
 * @param unit - 変換元の単位
 * @returns {number} - 変換後のバイト数
 */
export const convertUnitToByte = (value: number, unit: ByteUnit): number => {
  return value * BYTE_UNITS[unit];
};

export const toSize = (bytes: number): string => {
  // ガード節：数値でない、または有限でない場合はハイフンを返す
  if (!Number.isFinite(bytes)) {
    return "—";
  }

  // 0バイトのエッジケースを処理
  if (bytes === 0) {
    return "0 B";
  }

  // BYTE_UNITSから単位の配列を動的に生成（単一責任の原則）
  const units = Object.keys(BYTE_UNITS) as ByteUnit[];

  // 対数を使用して適切な単位のインデックスを計算し、範囲をクランプする
  const rawIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.max(0, Math.min(rawIndex, units.length - 1));

  // 単位を確実に取得（TypeScriptの型チェックに備えて非nullアサーション）
  const unit = units[index]!;

  // 実際の値に変換
  const value = bytes / BYTE_UNITS[unit];

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  });

  return `${formatter.format(value)} ${unit}`;
};

/**
 * バイトを最適な単位でフォーマット（詳細版：単位と数値を個別に取得可能）
 * @param bytes - バイト数
 * @returns オブジェクト { value: 数値, unit: 単位 } または null
 */
export const formatBytes = (
  bytes: number | undefined
): { value: number; unit: string } | null => {
  if (!bytes || !Number.isFinite(bytes)) {
    return null;
  }

  if (bytes === 0) {
    return { value: 0, unit: "B" };
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const clampedIndex = Math.min(index, units.length - 1);
  const unit = units[clampedIndex]!;
  const value = bytes / Math.pow(1024, clampedIndex);

  return { value: Math.round(value * 10) / 10, unit };
};

/**
 * イメージサイズをGB/MB単位でフォーマット
 * @param sizeBytes - バイト数
 * @returns フォーマットされたサイズ文字列 (例: "2.5GB", "512.3MB")
 */
export const formatImageSize = (sizeBytes: number | undefined): string => {
  const formatted = formatBytes(sizeBytes);
  if (!formatted) {
    return "—";
  }
  const { value, unit } = formatted;
  if (unit === "GB" || unit === "TB") {
    return `${value}${unit}`;
  } else {
    // MB未満の場合もMB単位で小数第1位まで表示
    const sizeInMB = convertByteToUnit(sizeBytes!, "MB", false);
    const roundedValue = Math.round(sizeInMB * 10) / 10;
    return `${roundedValue}MB`;
  }
};
