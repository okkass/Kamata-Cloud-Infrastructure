export default defineEventHandler(async (event) => {
<<<<<<< HEAD
  const body = await readBody(event);
  console.log("Received body:", body);
  return { message: "Data received", data: body };
=======
  // リクエストのボディをJSONとして読み込む
  const body = await readBody(event);

  // ターミナルに受け取った内容を表示
  console.log("--- Virtual Machine Creation Request Received ---");
  console.log(body);
  console.log("-----------------------------------------------");

  // レスポンスとして、受け取ったデータの一部を返す
  return {
    message: "Data received successfully",
    data: {
      id: crypto.randomUUID(), // ダミーのIDを生成
      name: body.name, // 受け取った名前をそのまま返す
    },
  };
>>>>>>> origin/main
});
