// 共通の詳細ページ用エラーハンドラ。データ未取得かつエラー時にSSRではthrow、CSRではshowErrorを実行し、カスタムエラーページへ誘導する。
import { watchEffect, type Ref } from "vue";
import { showError, createError } from "#app";

type GuardOptions = {
  notFoundMessage?: string;
  defaultStatusCode?: number;
};

/**
 * 詳細ページ共通のエラーハンドリング。
 * - 初回取得でデータが無く error がある: SSR では throw、CSR では showError
 * - 以降の取得でも、データが無い状態で error が出たら CSR では showError
 */
export function useResourceErrorGuard<T>(
  resource: Ref<T | null | undefined>,
  pending: Ref<boolean>,
  error: Ref<any>,
  opts: GuardOptions = {},
) {
  const buildError = () => {
    const errData = error.value as any;
    const statusCode = Number(
      errData?.statusCode || errData?.status || opts.defaultStatusCode || 404,
    );
    const message =
      errData?.data?.detail ||
      errData?.data?.message ||
      errData?.message ||
      opts.notFoundMessage ||
      "リソースが見つかりませんでした";
    return createError({ statusCode, message });
  };

  const handle = () => {
    if (!resource.value && error.value) {
      const nuxtErr = buildError();
      if (process.server) {
        throw nuxtErr;
      } else {
        showError(nuxtErr);
      }
    }
  };

  // 初回チェック
  handle();

  // CSR 遷移時・リトライ時も監視
  watchEffect(() => {
    if (!pending.value) handle();
  });
}
