// vmのrebootを実行するMock API

export default defineEventHandler(async (event) => {
  // リクエストのボディをJSONとして読み込む
  const body = await readBody(event);
  const id = event.context.params?.id;

  // ターミナルに受け取った内容を表示
  console.log(`--- Reboot Request Received for VM ID: ${id} ---`);
  console.log(body);
  console.log("-----------------------------------------------");

  // レスポンスとして、受け取ったデータの一部を返す
  return {
    message: `Reboot command received successfully for VM ID: ${id}`,
    data: {
      id: id,
      status: "rebooting", // ダミーのステータスを返す
    },
  };
});
