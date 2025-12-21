import { ref } from "vue";
import { $fetch } from "ofetch";
import type { FetchError } from "ofetch";
/**
 * 汎用的なリソース作成Composable
 *
 * @template TPayload - 作成時にAPIへ送信するデータの型
 * @template TResponse - 作成成功時にAPIから返却されるデータの型
 */
export const useResourceCreate = <
  TPayload extends Record<string, any>,
  TResponse
>(
  resourceName: string
) => {
  const isCreating = ref(false);

  const runtimeConfig = useRuntimeConfig();

  /**
   * リソースの作成を実行し、詳細な結果オブジェクトを返す
   * @param payload - 作成するリソースのデータ
   */
  const executeCreate = async (
    payload: TPayload
  ): Promise<CreateResult<TResponse>> => {
    if (isCreating.value) {
      console.warn("Create operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409,
        },
      };
    }
    isCreating.value = true;

    try {
      const responseData = await useNuxtApp().$apiFetch<TResponse>(
        `${resourceName}`,
        {
          method: "POST",
          body: payload,
        }
      );
      console.log(responseData);
      return { success: true, data: responseData };
    } catch (err: any) {
      const error = err as FetchError;
      const statusCode = error.statusCode || 500;

      switch (statusCode) {
        case 400:
          return {
            success: false,
            error: {
              type: "validation",
              message: "入力内容に誤りがあります。",
              statusCode,
            },
          };
        case 403:
          return {
            success: false,
            error: {
              type: "permission",
              message: "この操作を実行する権限がありません。",
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
      isCreating.value = false;
    }
  };

  return {
    executeCreate,
    isCreating,
  };
};
