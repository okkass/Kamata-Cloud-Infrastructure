// クライアント側のグローバルエラーハンドラー。致命的な未捕捉エラーをログし、必要に応じてカスタムエラーページへ誘導する。
/**
 * クライアント側のグローバルエラーハンドラー
 * キャッチされなかったエラーをすべてエラーページにリダイレクト
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Vue のエラーハンドラー（致命的なエラーのみ）
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error("Vue Error Handler:", error, info);

    // 致命的なエラーのみエラーページを表示
    // APIエラーなどはここでは処理しない
    if (error instanceof Error && error.message.includes("Cannot read")) {
      showError({
        statusCode: 500,
        statusMessage: "An error occurred",
        message: error.message,
        fatal: true,
      });
    }
  };

  // グローバルなエラーハンドラー（Nuxt hook）
  nuxtApp.hook("vue:error", (error, instance, info) => {
    console.error("Nuxt Vue Error:", error, info);
  });
});
