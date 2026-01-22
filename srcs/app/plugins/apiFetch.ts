export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: runtimeConfig.public.apiBaseUrl || "/api/", // デフォルト値を設定
    headers: {
      Authorization: "Bearer mock-token", // ハードコードなので、いずれ本物のトークンに置き換える必要があります
    },
    async onResponseError({ response }) {
      // エラーログを出力
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        data: response._data,
      });

      // APIエラーはそのまま throw して、呼び出し側でハンドリングさせる
      // showError は呼ばない（ページ全体のエラーページ表示を避ける）
    },
  });
  return {
    provide: {
      apiFetch: apiFetch as typeof $fetch,
    },
  };
});
