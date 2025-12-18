export default defineEventHandler(async (event) => {
  // useResourceUpdater から送られる { create:[], delete:[], patch:[] } を受け取る
  const body = await readBody(event);

  // ログに出して確認したい場合
  console.log("Storage Bulk Update:", body);

  return {
    status: "success",
    message: "Storages updated",
    // 受け取った内容をそのまま返して動作確認しやすくする
    details: body,
  };
});
