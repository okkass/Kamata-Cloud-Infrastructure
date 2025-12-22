export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const api_url = "/api/";

  const apiFetch = $fetch.create({
    baseURL: runtimeConfig.public.apiBaseUrl + api_url,
    headers: {
      Authorization: "Bearer mock-token", // ハードコードなので、いずれ本物のトークンに置き換える必要があります
    },
  });
  return {
    provide: {
      apiFetch: apiFetch as typeof $fetch,
    },
  };
});
