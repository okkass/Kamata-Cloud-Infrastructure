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
 * @param bytes - 変換元のバイト数
 * @param unit - 変換先の単位
 * @returns {number} - 変換後の整数値
 */
export const convertByteToUnit = (bytes: number, unit: ByteUnit): number => {
  return Math.round(bytes / BYTE_UNITS[unit]);
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
