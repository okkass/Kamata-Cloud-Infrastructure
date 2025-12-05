export default defineEventHandler((event) => {
  // プリフライトリクエストの処理
  if (event.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    return "";
  }
});
