export default defineEventHandler(async (event) => {
  // リクエストのボディをJSONとして読み込む
  const body = await readBody(event);

  // ターミナルに受け取った内容を表示
  console.log("--- Virtual Machine Creation Request Received ---");
  console.log("Name:", body.name);
  console.log("Instance Type ID:", body.instanceTypeId);

  // publicKeyが長い可能性があるので、最初の80文字だけ表示
  if (body.publicKey) {
    console.log(
      "Public Key (first 80 chars):",
      body.publicKey.substring(0, 80) + "..."
    );
  } else {
    console.log("Public Key: Not provided");
  }

  console.log("-----------------------------------------------");

  // レスポンスとして、受け取ったデータの一部を返す
  return {
    message: "Data received successfully",
    data: {
      id: crypto.randomUUID(), // ダミーのIDを生成
      name: body.name, // 受け取った名前をそのまま返す
    },
  };
});
