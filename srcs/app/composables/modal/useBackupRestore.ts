/**
 * =================================================================================
 * バックアップ復元ロジック (useBackupRestore.ts)
 * =================================================================================
 */
import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

export function useBackupRestore() {
  const { addToast } = useToast();
  // UI側のボタン無効化に使用するフラグ
  const isRestoring = ref(false);

  /**
   * 復元を実行する関数
   * @param id バックアップID
   * @param name バックアップ名（トースト表示用）
   */
  const executeRestore = async (id: string, name: string): Promise<boolean> => {
    // 1. 確認ポップアップ
    const isConfirmed = confirm(
      "【警告】\n本当に復元しますか？\n\n現在の仮想マシンの状態はこのバックアップの内容で上書きされ、元に戻すことはできません。"
    );

    if (!isConfirmed) return false;

    // 2. useResourceCreate の初期化
    const { executeCreate } = useResourceCreate<Record<string, never>, any>(
      `backups/${id}/restore`
    );

    isRestoring.value = true;

    try {
      // 3. APIリクエスト実行 (ペイロードは空オブジェクト)
      const result = await executeCreate({});

      if (result.success) {
        addToast({
          type: "success",
          message: `バックアップ「${name}」からの復元を開始しました。`,
        });
        return true;
      } else {
        // useResourceCreateが返したエラーメッセージを表示
        addToast({
          type: "error",
          message: "復元に失敗しました。",
          details: result.error?.message,
        });
        return false;
      }
    } catch (err: any) {
      addToast({
        type: "error",
        message: "予期しないエラーが発生しました。",
        details: err.message,
      });
      return false;
    } finally {
      isRestoring.value = false;
    }
  };

  return {
    isRestoring,
    executeRestore,
  };
}
