import { defineEventHandler, createError } from "h3";
// 新規接続されたストレージデバイスの一覧を取得するAPIのMock

export default defineEventHandler(async (event) => {
  const nodeId: string | undefined = event.context.params?.nodeId;
  // ノードIDごとに返す処理
  if (
    nodeId !== "d898bae4-0a05-48aa-846e-aca5bbfd72c6" &&
    nodeId !== "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39"
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: "Physical node not found",
    });
  }

  // Mock data for demonstration purposes

  if (nodeId === "d898bae4-0a05-48aa-846e-aca5bbfd72c6") {
    return [
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
  } else if (nodeId === "ba49196a-dfa7-4ce2-99c0-e4c4767f7b39") {
    return [
      {
        devicePath: "/dev/sdd",
        deviceName: "Storage Device C",
        size: 256 * 1024 ** 3, // 256 GB
      },
      {
        devicePath: "/dev/sde",
        deviceName: "Storage Device D",
        size: 2048 * 1024 ** 3, // 2 TB
      },
    ];
  }
});
