/**
 * 汎用的なリソース一覧取得Composable
 * useApiFetchを利用してエラーハンドリングを行います。
 * @param resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @param params - クエリパラメータ (任意)
 */
export const useResourceList = <T>(
  resourceName: string,
  params?: Record<string, any>
) => {
  const url = `/api/${resourceName}`;
  const { data, pending, error, refresh } = useFetch<T[]>(url, {
    params,
    default: () => [],
  });
  return {
    data,
    pending,
    error,
    refresh,
  };
};
