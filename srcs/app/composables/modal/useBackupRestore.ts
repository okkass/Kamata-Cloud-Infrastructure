/**
 * =================================================================================
 * バックアップ復元ロジック (useBackupRestore.ts)
 * =================================================================================
 */
import { ref } from "vue";
import { useToast } from "~/composables/useToast";

export function useBackupRestore() {
  const { addToast } = useToast();
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

    if (!isConfirmed) {
      return false;
    }

    isRestoring.value = true;

    try {
      await $fetch(`backups/${id}/restore`, {
        method: "POST",
      });

      addToast({
        type: "success",
        message: `バックアップ「${name}」からの復元を開始しました。`,
      });
      return true;
    } catch (error: any) {
      console.error("Restore failed:", error);
      addToast({
        type: "error",
        message: "復元に失敗しました。",
        details: error?.data?.message || error.message,
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
