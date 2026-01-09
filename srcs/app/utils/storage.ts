/**
 * =================================================================================
 * ストレージ関連のユーティリティ関数
 * =================================================================================
 */

/**
 * ストレージプール情報を計算して返す
 */
export interface StoragePoolInfo {
  /** 空き容量（バイト） */
  availableSize: number;
  /** 使用率（0-100） */
  usagePercent: number;
  /** フォーマット済み空き容量表示 */
  availableSizeFormatted: string;
  /** フォーマット済み総容量表示 */
  totalSizeFormatted: string;
  /** フォーマット済み使用量表示 */
  usedSizeFormatted: string;
}

/**
 * ストレージプールの容量情報を計算
 * @param pool - StoragePoolResponse
 * @returns 計算済みのストレージプール情報
 */
export const getStoragePoolInfo = (
  pool: StoragePoolResponse
): StoragePoolInfo => {
  const availableSize = pool.totalSize - pool.usedSize;
  const usagePercent =
    pool.totalSize > 0 ? Math.round((pool.usedSize / pool.totalSize) * 100) : 0;

  return {
    availableSize,
    usagePercent,
    availableSizeFormatted: formatStorageSize(availableSize),
    totalSizeFormatted: formatStorageSize(pool.totalSize),
    usedSizeFormatted: formatStorageSize(pool.usedSize),
  };
};

/**
 * バイト数を人間が読みやすいフォーマットに変換
 * @param bytes - バイト数
 * @returns フォーマット済みサイズ（例: "1.5 GB"）
 */
export const formatStorageSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted =
    size % 1 === 0 ? size.toString() : size.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted} ${units[unitIndex]}`;
};

/**
 * ストレージプールの容量をタイトルテキスト（詳細情報）として取得
 * @param pool - StoragePoolResponse
 * @returns タイトル表示用の詳細情報テキスト
 */
export const getStoragePoolTitle = (pool: StoragePoolResponse): string => {
  const info = getStoragePoolInfo(pool);
  return `総容量: ${info.totalSizeFormatted} | 使用中: ${info.usedSizeFormatted} | 空き: ${info.availableSizeFormatted} (${info.usagePercent}% 使用中)`;
};
