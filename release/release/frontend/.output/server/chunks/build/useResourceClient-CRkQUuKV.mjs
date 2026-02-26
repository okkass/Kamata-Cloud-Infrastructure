import { f as useNuxtApp } from './server.mjs';

const useApiClient = () => {
  const request = async (url, options = {}) => {
    const { method = "GET", body, params, headers } = options;
    return await useNuxtApp().$apiFetch(url, {
      method,
      body,
      params,
      // GET時のクエリパラメータ (?id=1など)
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      // エラーハンドリングの一元化（必要であれば）
      async onResponseError({ response }) {
        if (response.status === 401) {
          console.error("認証エラーです");
        } else if (response.status === 500) {
          console.error("サーバーエラーが発生しました");
        }
      }
    });
  };
  return {
    request,
    get: (url, params) => request(url, { method: "GET", params }),
    post: (url, body) => request(url, { method: "POST", body }),
    put: (url, body) => request(url, { method: "PUT", body }),
    del: (url, body) => request(url, { method: "DELETE", body }),
    patch: (url, body) => request(url, { method: "PATCH", body })
  };
};

export { useApiClient as u };
//# sourceMappingURL=useResourceClient-CRkQUuKV.mjs.map
