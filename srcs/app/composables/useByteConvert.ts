export const useByteConvert = () => {
  const units = {
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
  };

  const convertByteToUnit = (bytes: number, unit: "KB" | "MB" | "GB"): number => {
    return parseFloat((bytes / units[unit]).toFixed());
  };

  const convertUnitToByte = (value: number, unit: "KB" | "MB" | "GB"): number => {
    return value * units[unit];
  };

  return { convertByteToUnit, convertUnitToByte };
};
