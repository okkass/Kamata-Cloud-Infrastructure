/**
 * エラーメッセージを抽出するユーティリティ関数
 * @param error - エラーオブジェクト
 * @param defaultMessage - デフォルトメッセージ（エラーメッセージが取得できない場合に使用）
 * @returns 抽出されたエラーメッセージ
 */
export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string = "エラーが発生しました。"
): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    return ((err.data as Record<string, unknown> | undefined)?.message ??
      err.message ??
      defaultMessage) as string;
  }
  return defaultMessage;
};
