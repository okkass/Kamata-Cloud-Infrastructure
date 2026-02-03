// UIを表示する前にログイン済みかチェックし、未ログインならログインページにリダイレクトするミドルウェア
export default defineEventHandler(async (event) => {
  // RUN_MODE=mockなら処理をスルー
  const runtimeConfig = useRuntimeConfig();
  if (runtimeConfig.public.runMode === "mock") {
    console.warn("Mock mode: skipping login check middleware.");
    return;
  }

  // login、logout、_nuxt_iconに行きたい人はスルー
  const url = getRequestURL(event).pathname;
  if (
    url.startsWith("/login") ||
    url.startsWith("/logout") ||
    url.startsWith("/api/auth/") ||
    url.startsWith("/api/_nuxt_icon/")
  ) {
    return;
  }
  // /api以下を叩きたい人判定
  const isApi = url.startsWith("/api/");

  // トークンをクッキーから取得
  const token = getTokenFromEvent(event);

  // トークンがなければリフレッシュトークンの確認へ
  if (!token) {
    const refreshToken = getRefreshTokenFromEvent(event);
    if (!refreshToken) {
      // API呼び出しなら401エラーを返す
      if (isApi) {
        return sendApiError(event, {
          status: 401,
          detail: "認証されていません。",
        });
      }
      // リフレッシュトークンもなければログインページへリダイレクト
      return sendRedirect(event, "/login");
    }
    // リフレッシュトークンでリフレッシュを試みる
    const res = await fetchRefreshToken(refreshToken);
    if (!res) {
      // API呼び出しなら401エラーを返す
      if (isApi) {
        return sendApiError(event, {
          status: 401,
          detail: "認証に失敗しました。",
        });
      }
      // リフレッシュに失敗したらログインページへリダイレクト
      return sendRedirect(event, "/login");
    }
    // リフレッシュ成功時は新しいトークンとリフレッシュトークンをクッキーにセット
    setTokenCookie(event, res.token);
    setRefreshTokenCookie(event, res.refreshToken);
    return;
  }

  // トークンがあれば有効確認へ
  const user = await fetchUserMe(token);
  if (!user) {
    // API呼び出しなら401エラーを返す
    if (isApi) {
      return sendApiError(event, {
        status: 401,
        detail: "認証に失敗しました。",
      });
    }
    // トークンが無効ならログインページへリダイレクト
    return sendRedirect(event, "/login");
  }
});
