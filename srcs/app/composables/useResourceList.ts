import type { MaybeRef } from "vue";
import { toValue } from "vue";
import type { UseFetchOptions } from "#app";

/**
 * useFetchのオプション型から不要なプロパティを除外
 */
type UseResourceListOptions = Omit<
  UseFetchOptions<any>,
  "$fetch" | "key" | "default"
> & {
  params?: MaybeRef<Record<string, string | number | boolean> | undefined>;
};

/**
 * 汎用的なリソース一覧取得Composable
 *
 * @template T - リスト内のアイテムの型 (例: SecurityGroupDTO)
 * @param {string} resourceName - APIのエンドポイント名 (例: 'security-groups')
 * @param {MaybeRef<Record<string, string | number | boolean> | undefined> | UseResourceListOptions} [paramsOrOptions] - クエリパラメータまたはuseFetchのオプション
 * @returns {object} - useFetchから返されるリアクティブな状態を含むオブジェクト
 */
export const useResourceList = <T>(
  resourceName: string,
  paramsOrOptions?:
    | MaybeRef<Record<string, string | number | boolean> | undefined>
    | UseResourceListOptions
) => {
  // APIのエンドポイントURLを構築
  const url = `${resourceName}`;

  // paramsOrOptionsがオプションオブジェクトか、単純なparamsかを判定
  let options: UseResourceListOptions = {};

  if (
    paramsOrOptions &&
    typeof paramsOrOptions === "object" &&
    "params" in paramsOrOptions
  ) {
    // useFetchのオプション形式
    options = paramsOrOptions as UseResourceListOptions;
  } else {
    // 単純なparams形式（後方互換性のため）
    options = {
      params: paramsOrOptions as MaybeRef<
        Record<string, string | number | boolean> | undefined
      >,
    };
  }

  const { params, ...restOptions } = options;

  // 取得したデータ(data)、ローディング状態(pending)、エラー情報(error)、
  // そしてデータを再取得するための関数(refresh)をオブジェクトとして返す。

  return useFetch<T[]>(url, {
    $fetch: useNuxtApp().$apiFetch,
    params,
    default: () => [],
    // paramsがref/computedの場合、変更時に自動再取得を行う
    watch: params ? [() => toValue(params)] : false,
    ...restOptions,
  });
};
