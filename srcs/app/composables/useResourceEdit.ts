import { ref } from "vue";
import { $fetch } from "ofetch";
import type { FetchError } from "ofetch";
/**
 * 汎用的なリソース更新Composable
 *
 * @template TPayload - 更新時にAPIへ送信するデータの型
 * @template TResponse - 更新成功時にAPIから返却されるデータの型
 */
export const useResourceUpdate = <
  TPayload extends Record<string, any>,
  TResponse
>(
  resourceName: string
) => {
  const isUpdating = ref(false);

  const runtimeConfig = useRuntimeConfig();

  /**
   * リソースの更新を実行し、詳細な結果オブジェクトを返す
   * @param id - 更新するリソースのID
   * @param payload - 更新するデータ
   */
  const executeUpdate = async (
    id: string,
    payload: TPayload
  ): Promise<UpdateResult<TResponse>> => {
    if (isUpdating.value) {
      console.warn("Update operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409,
        },
      };
    }
    isUpdating.value = true;

    try {
      // $fetchを使用してPUTリクエストを送信
      const responseData = await $fetch<TResponse>(
        `/api/${resourceName}/${id}`,
        {
          baseURL: runtimeConfig.public.apiBaseUrl,
          method: "PUT",
          body: payload,
        }
      );

      // 200 OK
      return { success: true, data: responseData };
    } catch (err: any) {
      const error = err as FetchError;
      const statusCode = error.statusCode || 500;

      switch (statusCode) {
        case 400: // リクエストエラー (バリデーションエラー)
          return {
            success: false,
            error: {
              type: "validation",
              message: "入力内容に誤りがあります。",
              statusCode,
            },
          };
        case 403: // 権限エラー
          return {
            success: false,
            error: {
              type: "permission",
              message: "この操作を実行する権限がありません。",
              statusCode,
            },
          };
        case 404: // Not Found
          return {
            success: false,
            error: {
              type: "notFound",
              message: "更新対象のデータが見つかりませんでした。",
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
      isUpdating.value = false;
    }
  };

  return {
    executeUpdate,
    isUpdating,
  };
};
