// 新規接続されたストレージデバイスの一覧を取得するAPIのMock

export default defineEventHandler(async (event) => {
  const newDevices = [
    {
      devicePath: "/dev/sdb",
      deviceName: "Storage Device A",
      size: 512 * 1024 ** 2, // 512 GB
    },
    {
      devicePath: "/dev/sdc",
      deviceName: "Storage Device B",
      size: 1024 * 1024 ** 2, // 1 TB
    },
  ];

  return newDevices;
});
