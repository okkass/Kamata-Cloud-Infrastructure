/**
 * データ取得エラー時のハンドリングをサポートするComposable
 * エラーページではなくトースト通知でエラーを表示する
 */

type ErrorOptions = {
  /** エラーメッセージ。指定しない場合は標準のメッセージを使用 */
  errorMessage?: string;
  /** エラー発生時のコールバック */
  onError?: (error: any) => void;
};

/**
 * リソース取得のエラーハンドリング。
 * エラーが発生した場合、エラーページではなくトースト通知を表示する
 *
 * @param error - useFetchから取得したエラーRef
 * @param options - ハンドリングオプション
 */
export function useResourceFetchHandler(
  error: Ref<any>,
  options: ErrorOptions = {},
) {
  const toast = useToast();
  const hasHandled = ref(false);

  const handleError = () => {
    if (error.value && !hasHandled.value) {
      hasHandled.value = true;

      const errorData = error.value as any;
      const message =
        options.errorMessage ||
        errorData?.data?.detail ||
        errorData?.data?.message ||
        errorData?.message ||
        "データの取得に失敗しました";

      toast.addToast({
        type: "error",
        message,
      });

      options.onError?.(error.value);
    }
  };

  const handleSuccess = () => {
    if (!error.value && hasHandled.value) {
      hasHandled.value = false;
    }
  };

  // エラーの監視
  watchEffect(() => {
    if (error.value) {
      handleError();
    } else {
      handleSuccess();
    }
  });

  return {
    handleError,
    resetError: () => {
      hasHandled.value = false;
    },
  };
}
