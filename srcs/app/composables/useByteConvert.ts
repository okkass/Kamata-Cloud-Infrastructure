export const useByteConvert = () => {
  const units = {
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
  };

  /**
   * バイトを指定された単位に変換し、最も近い整数に丸める
   * @param bytes - 変換元のバイト数
   * @param unit - 変換先の単位
   * @returns {number} - 変換後の整数値
   */
  const convertByteToUnit = (
    bytes: number,
    unit: "KB" | "MB" | "GB"
  ): number => {
    return Math.round(bytes / units[unit]);
  };

  /**
   * 指定された単位の値をバイトに変換する
   * @param value - 変換元の数値
   * @param unit - 変換元の単位
   * @returns {number} - 変換後のバイト数
   */
  const convertUnitToByte = (
    value: number,
    unit: "KB" | "MB" | "GB"
  ): number => {
    return value * units[unit];
  };

  return { convertByteToUnit, convertUnitToByte };
};
