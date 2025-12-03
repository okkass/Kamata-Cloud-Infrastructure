// ----------------------------------------------------------------------------
// Composable
// ----------------------------------------------------------------------------
/**
 * アプリケーション全体でToast通知を管理するComposable
 */
export const useToast = () => {
  // NuxtのuseStateを使い、単一の共有stateを生成
  const toasts = useState<Toast[]>("toasts", () => []);

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
  const addToast = (payload: ToastPayload): string => {
    const id = crypto.randomUUID();
    const type = payload.type ?? "info";
    // アップロード中は自動で消えないように duration を 0 (無制限) にする等の制御も可能
    const duration = payload.duration ?? (type === "error" ? 6000 : 3000);

    toasts.value.push({ id, ...payload, type, duration });

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id; // ★ IDを返す
  };

  const updateToast = (id: string, updates: Partial<ToastPayload>) => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast) {
      // オブジェクトの内容を書き換える（リアクティブに反映される）
      Object.assign(toast, updates);
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
  };
};
