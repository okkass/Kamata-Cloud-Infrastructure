/**
 * 汎用的なリソース一覧取得Composable
 *
 * @template T - リスト内のアイテムの型 (例: SecurityGroupDTO)
 * @param {string} resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @param {Record<string, any>} [params] - クエリパラメータ (任意)
 * @returns {object} - useFetchから返されるリアクティブな状態を含むオブジェクト
 */
export const useResourceList = <T>(
  resourceName: string,
  params?: Record<string, any>
) => {
  // APIのエンドポイントURLを構築
  const url = `/api/${resourceName}`;

  // NuxtのuseFetchを使用して、APIからリソースの一覧を非同期で取得
  const { data, pending, error, refresh } = useFetch<T[]>(url, {
    params,
    // defaultオプション: データ取得中の初期値を空配列に設定。
    // これにより、UI側でv-forがエラーになるのを防ぎます。
    default: () => [],
  });

  // 取得したデータ(data)、ローディング状態(pending)、エラー情報(error)、
  // そしてデータを再取得するための関数(refresh)をオブジェクトとして返す。
  return {
    data,
    pending,
    error,
    refresh,
  };
};
