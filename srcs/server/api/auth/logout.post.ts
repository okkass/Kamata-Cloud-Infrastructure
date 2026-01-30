export default defineEventHandler(async (event) => {
  // クッキーからトークンを削除
  deleteTokenCookie(event);
  // リフレッシュトークンがあるならバックエンドにも通知して無効化
  const refreshToken = getRefreshTokenFromEvent(event);
  if (refreshToken) {
    const baseUrl = useRuntimeConfig().public.backendUrl;
    const url = `${baseUrl}auth/logout`;
    try {
      await $fetch(url, {
        method: "POST",
        body: { refreshToken },
      });
    } catch (error) {
      console.error("ログアウト通知に失敗:", error);
    }
  }
  deleteRefreshTokenCookie(event);
  return { success: true };
});
