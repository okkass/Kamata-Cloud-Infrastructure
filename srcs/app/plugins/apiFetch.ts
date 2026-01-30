export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  // 環境変数からモックかどうかを判定
  if (runtimeConfig.public.mock === "true") {
    console.warn("Mock API Fetch is enabled.");
    const apiFetch = $fetch.create({
      baseURL: runtimeConfig.public.apiBaseUrl,
      headers: {
        Authorization: "Bearer mock-token", // ハードコードなので、いずれ本物のトークンに置き換える必要があります
      },
    });
    return {
      provide: {
        apiFetch: apiFetch as typeof $fetch,
      },
    };
  }
  // 本番用
  // サーバーサイドではリクエストヘッダーからトークンを取得してセットする
  let apiFetch;
  if (import.meta.server) {
    console.log("Server-side API Fetch");
    const headers = useRequestHeaders(["cookie"]);
    apiFetch = $fetch.create({
      baseURL: runtimeConfig.public.apiBaseUrl,
      headers: {
        ...headers,
      },
    });
  } else {
    console.log("Client-side API Fetch");
    apiFetch = $fetch.create({
      baseURL: runtimeConfig.public.apiBaseUrl,
    });
  }
  return {
    provide: {
      apiFetch: apiFetch as typeof $fetch,
    },
  };
});
