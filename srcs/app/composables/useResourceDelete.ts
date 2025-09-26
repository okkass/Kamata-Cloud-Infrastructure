import { computed, ref } from "vue";
import type { FetchError } from "ofetch";

/**
 * 汎用的なリソース削除Composable
 * @param resourceName - APIのエンドポイント名
 */
export const useResourceDelete = (resourceName: string) => {
  const targetId = ref<string | null>(null);

  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const authToken = useCookie("auth-token");

  const { execute, status, error } = useFetch<void>(
    () => `/api/${resourceName}/${targetId.value}`,
    {
      method: "DELETE",
      immediate: false,
      watch: false,
    }
  );

  /**
   * 削除を実行する関数
   * @param id - 削除するリソースのID
   */
  const executeDelete = async (id: string): Promise<DeleteResult> => {
    if (status.value === "pending") {
      console.warn("Delete operation is already in progress.");
      return {
        success: false,
        error: {
          type: "unknown",
          message: "処理が重複しています。",
          statusCode: 409,
        },
      };
    }

    targetId.value = id;

    await execute();

    if (!error.value) {
      return { success: true };
    } else {
      const fetchError = error.value as FetchError;
      const statusCode = fetchError.statusCode || 500;

      switch (statusCode) {
        case 403:
          return {
            success: false,
            error: {
              type: "permission",
              message: "この操作を実行する権限がありません。",
              statusCode,
            },
          };
        case 404:
          return {
            success: false,
            error: {
              type: "notFound",
              message: "削除対象のデータが見つかりませんでした。",
              statusCode,
            },
          };
        default:
          return {
            success: false,
            error: {
              type: "unknown",
              message: `サーバーエラーが発生しました。(Code: ${statusCode})`,
              statusCode,
            },
          };
      }
    }
  };

  return {
    executeDelete,
    isDeleting: computed(() => status.value === "pending"),
    error,
  };
};
