// /api/me へのGETリクエストを処理
export default defineEventHandler((event) => {
  // リクエストヘッダーを取得
  const headers = getRequestHeaders(event);

  // Authorizationヘッダーを確認
  const authHeader = headers.authorization;

  // テスト用の正しいトークン
  const validToken = 'Bearer my-secret-token';

  // ヘッダーが存在し、内容が正しいかチェック
  if (authHeader === validToken) {
    // 認証成功
    setResponseStatus(event, 200); // 成功ステータス
    return {
      user: {
        id: 1,
        name: 'テストユーザー',
        email: 'test@example.com',
      },
    };
  }

  // 認証失敗
  // 401エラーを投げる
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
    message: '認証トークンが無効です。',
  });
});