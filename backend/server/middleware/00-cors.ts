export default defineEventHandler((event) => {
  // ヘッダーの付与
  setResponseHeader(
    event,
    "Access-Control-Allow-Origin",
    "http://localhost:3000"
  );
  setResponseHeader(
    event,
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  setResponseHeader(
    event,
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  setResponseHeader(event, "Access-Control-Allow-Credentials", "true");

  // プリフライトリクエストの処理
  if (event.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    return "";
  }

  // それ以外はそのまま続行
  return;
});
