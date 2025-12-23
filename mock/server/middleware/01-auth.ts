export default defineEventHandler((event) => {
  // モック用の簡易認証ミドルウェア
  const authHeader = getRequestHeader(event, "Authorization");
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;

  // トークン持ってなかったら
  if (!token) {
    setHeader(event, "WWW-Authenticate", 'Bearer error="token_required"');
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication token is required.",
    });
  }
  // トークンが不正だったら
  if (token !== "mock-token") {
    setHeader(event, "WWW-Authenticate", 'Bearer error="invalid_token"');
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid authentication token.",
    });
  }

  // トークンが有効ならそのまま続行
  return;
});
