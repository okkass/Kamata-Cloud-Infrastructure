// HTTPメソッドの型定義
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// パラメータの型定義
interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  params?: any; // クエリパラメータ用
  headers?: Record<string, string>;
}

export const useApiClient = () => {
  const runtimeConfig = useRuntimeConfig();

  /**
   * APIリクエストを実行する共通関数
   * @param url - エンドポイントのURL
   * @param options - リクエストオプション
   */
  const request = async <T>(url: string, options: ApiOptions = {}) => {
    const { method = "GET", body, params, headers } = options;

    return await $fetch<T>(url, {
      method,
      body,
      params, // GET時のクエリパラメータ (?id=1など)
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },

      // エラーハンドリングの一元化（必要であれば）
      async onResponseError({ response }) {
        // 401エラーならログアウト処理をする、などの共通処理
        if (response.status === 401) {
          console.error("認証エラーです");
        } else if (response.status === 500) {
          console.error("サーバーエラーが発生しました");
        }
      },
    });
  };

  // 使いやすくするためにメソッドごとのヘルパーも返せます
  return {
    request,
    get: <T>(url: string, params?: any) =>
      request<T>(url, { method: "GET", params }),
    post: <T>(url: string, body?: any) =>
      request<T>(url, { method: "POST", body }),
    put: <T>(url: string, body?: any) =>
      request<T>(url, { method: "PUT", body }),
    del: <T>(url: string, body?: any) =>
      request<T>(url, { method: "DELETE", body }),
    patch: <T>(url: string, body?: any) =>
      request<T>(url, { method: "PATCH", body }),
  };
};
