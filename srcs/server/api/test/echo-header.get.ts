export default defineEventHandler((event) => {
  // リクエストヘッダーをすべて取得
  const headers = getRequestHeaders(event);

  // 'x-custom-test-header'の値を取り出す
  const encodedMessage = headers["x-custom-test-header"];
  const anotherHeader = headers["x-another-header"];

  // ヘッダーが存在するかチェック
  if (!encodedMessage) {
    return {
      error: "x-custom-test-headerが見つかりません。",
    };
  }

  // デコード処理
  let decodedMessage = "";
  try {
    // decodeURIComponentで元の日本語に戻す
    decodedMessage = decodeURIComponent(encodedMessage);
  } catch (e) {
    console.error("デコードに失敗しました:", e);
    return {
      error: "ヘッダーのデコードに失敗しました。",
    };
  }

  // デコードしたメッセージをコンソールに表示（サーバーのターミナルに表示される）
  console.log("デコードされたメッセージ:", decodedMessage);

  // クライアントにも返してみる
  return {
    originalHeaderValue: encodedMessage,
    decodedMessage: decodedMessage,
    anotherHeader: anotherHeader || null,
  };
});
