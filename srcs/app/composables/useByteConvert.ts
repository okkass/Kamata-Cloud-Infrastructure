export const useByteConvert = () => {
  const convertByteToUnit = (bytes: number, unit: "KB" | "MB" | "GB"): number => {
    const units = {
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
    };
    return parseFloat((bytes / units[unit]).toFixed());
  };

  const convertUnitToByte = (value: number, unit: "KB" | "MB" | "GB"): number => {
    const units = {
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
    };
    return value * units[unit];
  };

  return { convertByteToUnit, convertUnitToByte };
};
