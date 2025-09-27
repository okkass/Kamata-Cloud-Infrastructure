// ----------------------------------------------------------------------------
// Composable
// ----------------------------------------------------------------------------
/**
 * アプリケーション全体でToast通知を管理するComposable
 */
export const useToast = () => {
  // NuxtのuseStateを使い、単一の共有stateを生成
  const toasts = useState<Toast[]>('toasts', () => []);

  /**
   * 指定されたIDのトーストをリストから削除する
   * @param id - 削除するトーストのID
   */
  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  /**
   * 新しいトーストを追加する
   * @param payload - 表示するトーストの情報
   */
  const addToast = (payload: ToastPayload) => {
    const id = crypto.randomUUID();

    // デフォルトのtypeを 'info' に設定
    const type = payload.type ?? 'info';

    // デフォルトの表示時間をtypeに応じて設定
    const defaultDuration = type === 'error' ? 6000 : 3000;
    const duration = payload.duration ?? defaultDuration;

    // 新しいトーストをリストの末尾に追加
    toasts.value.push({ id, ...payload, type });

    // 指定時間が経過したら自動的にトーストを削除
    setTimeout(() => removeToast(id), duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
};