import { ref } from "vue";
import { $fetch } from "ofetch";
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
  // 処理の実行中状態を管理するための、このComposable専用のref
  const isLoading = ref(false);

  /**
   * 削除を実行し、詳細な結果オブジェクトを返す
   * @param {string} id - 削除するリソースのID
   * @returns {Promise<DeleteResult>} - 削除処理の結果
   */
  const executeDelete = async (id: string): Promise<DeleteResult> => {
    // 既に処理が実行中の場合は、二重送信を防止するための安全装置
    if (isLoading.value) {
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

    isLoading.value = true;

    try {
      // $fetchを直接呼び出してDELETEリクエストを送信
      // 成功した場合、この行は例外を投げずに完了する
      await $fetch(`/api/${resourceName}/${id}`, {
        method: "DELETE",
        // 注: 認証ヘッダーなどは$fetchのグローバル設定(plugins/api.tsなど)で行うのが望ましい
      });

      // 例外が発生しなかったので、成功としてレポートを返す
      return { success: true };
    } catch (err: any) {
      // $fetchが4xx/5xx系のエラーを検知すると、例外が投げられ、このcatchブロックが実行される
      const error = err as FetchError;
      const statusCode = error.statusCode || 500;

      // エラーのステータスコードに応じて内容を分類し、レポートとして返す
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
    } finally {
      // 処理が成功・失敗にかかわらず、必ずローディング状態を解除する
      isLoading.value = false;
    }
  };

  return {
    executeDelete,
    isDeleting: isLoading, // isDeletingからisLoadingに名前を変更
  };
};
