import type { MaybeRef } from "vue";
import { toValue } from "vue";

/**
 * 汎用的なリソース一覧取得Composable
 *
 * @template T - リスト内のアイテムの型 (例: SecurityGroupDTO)
 * @param {string} resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @param {MaybeRef<Record<string, any> | undefined>} [params] - クエリパラメータ (任意)
 * @returns {object} - useFetchから返されるリアクティブな状態を含むオブジェクト
 */
export const useResourceList = <T>(
  resourceName: string,
  params?: MaybeRef<Record<string, any> | undefined>
) => {
  // APIのエンドポイントURLを構築
  const url = `${resourceName}`;

  // 取得したデータ(data)、ローディング状態(pending)、エラー情報(error)、
  // そしてデータを再取得するための関数(refresh)をオブジェクトとして返す。

  return useFetch<T[]>(url, {
    $fetch: useNuxtApp().$apiFetch,
    params,
    default: () => [],
    // paramsがref/computedの場合、変更時に自動再取得を行う
    watch: [() => toValue(params)],
  });
};
