import type { UseFetchOptions } from "nuxt/app";

export const useApiFetch = <T>(
  url: string,
  options: UseFetchOptions<T> = {}
) => {
  const authToken = useCookie("auth-token");
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const headers = new Headers((options.headers as HeadersInit) || {});
  if (authToken.value) {
    headers.set("Authorization", `Bearer ${authToken.value}`);
  }
  return useFetch(url, {
    ...options,
    baseURL: apiBase as string,
    headers,

    onResponseError({ response }) {
      if (response.status === 401) {
        authToken.value = null;
        navigateTo("/login");
        useToast().addToast({
          message: "Session expired. Please log in again.",
          type: "error",
        });
      }
    },
  });
};
