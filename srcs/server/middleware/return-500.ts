export default defineEventHandler((event) => {
  // Nuxt Iconモジュールの内部APIリクエストは501エラーの対象外とする
  // （/api/_nuxt_icon/ は Nuxt Icon モジュールが内部的に利用するエンドポイントのため）
  if (event.path.startsWith("/api/_nuxt_icon/")) {
    return;
  }
  if (event.path.startsWith("/api/")) {
    setResponseStatus(event, 501);
    return { message: "Not Implemented" };
  }
});
