export default defineEventHandler((event) => {
  // プリフライトリクエストの処理
  if (event.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    return "";
  }
<<<<<<< HEAD
=======

  // それ以外はそのまま続行
  return;
>>>>>>> b8b142f5a7a9c5574aa9e6efbb7ffef3f5f5656a
});
