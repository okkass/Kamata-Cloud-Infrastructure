import type { MaybeRef } from "vue";
import { unref } from "vue";

/**
 * 汎用的な単一リソース詳細取得Composable
 *
 * @template T - 取得するリソースの型 (例: SecurityGroupDTO)
 * @param {string} resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @param {MaybeRef<string>} id - 取得するリソースのID。refでも文字列でも可。
 * @returns {AsyncData<T, FetchError>} - useFetchの戻り値と同じオブジェクト
 */
export const useResourceDetail = <T>(
  resourceName: string,
  id: MaybeRef<string>
) => {
  // unref() を使い、引数のidがrefでも文字列でもその値を取得できるようにする
  const resourceId = unref(id);

  const url = `${resourceName}/${resourceId}`;
  // useFetch を使い、単一のオブジェクトを取得する
  return useFetch<T>(url, {
    $fetch: useNuxtApp().$apiFetch,
    default: () => undefined,
    key: `useResourceDetail-${resourceName}-${resourceId}`,
  });
};
