// 新規接続されたストレージデバイスの一覧を取得するAPIのMock

export default defineEventHandler(async (event) => {
  const newDevices = [
    {
      devicePath: "/dev/sdb",
      deviceName: "Storage Device A",
      capacityGB: 512,
    },
    {
      devicePath: "/dev/sdc",
      deviceName: "Storage Device B",
      capacityGB: 1024,
    },
  ];

  return newDevices;
});
