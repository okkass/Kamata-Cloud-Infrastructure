// ログイン、ログアウト以外のAPI呼び出しをここで受け取る

// ここでcookie->JWTの変換を行う
export default defineEventHandler(async (event) => {
  // ミドルウェアでチェック済みなのでクッキーからトークンを取得するだけ
  const token = getTokenFromEvent(event) as string;

  const baseUrl = useRuntimeConfig().public.backendUrl;
  // 元のリクエストからパスを取得
  const slug = event.context.params?.slug;

  const headers = {
    ...getHeaders(event),
    Authorization: `Bearer ${token}`,
  };

  const url = `${baseUrl}${slug}`;

  const method = event.node.req.method || "GET";

  if (method === "GET" || method === "DELETE") {
    return await $fetch(url, {
      method,
      headers,
      query: getQuery(event),
      ignoreResponseError: true,
    });
  }

  // bodyはそのまま転送
  const body = event.node.req;

  const res = await fetch(url, {
    method,
    headers,
    body: body as any,
  });
  return sendStream(event, res.body as any);
});
