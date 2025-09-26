import { computed, ref } from "vue";
import type { FetchError } from "ofetch";
// ----------------------------------------------------------------------------
// Composable
// ----------------------------------------------------------------------------

/**
 * 汎用的なリソース削除Composable
 *
 * @param {string} resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @returns {object} - executeDelete関数と、isDeletingリアクティブ状態を含むオブジェクト
 */
export const useResourceDelete = (resourceName: string) => {
  // 削除対象のリソースIDをリアクティブに保持
  const targetId = ref<string | null>(null);

  // --- 共通のAPI設定を追加 ---
  const authToken = useCookie("auth-token");
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  // useFetchを`immediate: false`でセットアップし、任意のタイミングで実行可能にする
  const { execute, status, error } = useFetch<void>(
    // URLはリアクティブなcomputedプロパティとして定義
    () => `/api/${resourceName}/${targetId.value}`,
    {
      baseURL: apiBase as string,
      method: "DELETE",
      headers: {
        ...(authToken.value && { Authorization: `Bearer ${authToken.value}` }),
      },
      // immediate: false - コンポーネント読み込み時に自動で実行しない
      immediate: false,
      // watch: false - 参照しているリアクティブな値(targetId)が変更されても自動で実行しない
      watch: false,
    }
  );

  /**
   * 削除を実行し、詳細な結果オブジェクトを返す
   * @param {string} id - 削除するリソースのID
   * @returns {Promise<DeleteResult>} - 削除処理の結果
   */
  const executeDelete = async (id: string): Promise<DeleteResult> => {
    // 既に処理が実行中の場合は、二重送信を防止するための安全装置
    if (status.value === "pending") {
      console.warn("Delete operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409,
        },
      };
    }

    targetId.value = id;
    await execute(); // APIリクエストを実際に実行

    // useFetchから返されたerrorオブジェクトを評価して、結果をレポートとして返す
    if (!error.value) {
      // エラーがなければ成功
      return { success: true };
    } else {
      // エラーがある場合は、ステータスコードに応じて内容を分類
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
    // isDeletingはuseFetchのstatusプロパティから算出するリアクティブな値
    isDeleting: computed(() => status.value === "pending"),
  };
};
