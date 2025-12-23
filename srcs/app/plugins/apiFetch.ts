export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

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
});
