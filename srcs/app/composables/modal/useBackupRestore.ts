/**
 * =================================================================================
 * バックアップ復元ロジック (useBackupRestore.ts)
 * =================================================================================
 */
import { computed, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

export function useBackupRestore() {
  const { addToast } = useToast();
  const isRestoring = ref(false);

  /**
   * バックアップ復元APIを実行する
   * @param id バックアップID
   * @param name バックアップ名（トースト表示用）
   */
  const executeRestoreApi = async (
    id: string,
    name: string
  ): Promise<boolean> => {
    const { executeCreate } = useResourceCreate<Record<string, never>, any>(
      `backups/${id}/restore`
    );

    isRestoring.value = true;
    try {
      const result = await executeCreate({});

      addToast({
        type: result.success ? "success" : "error",
        message: result.success
          ? `バックアップ「${name}」からの復元を開始しました。`
          : "復元に失敗しました。",
        details: result.error?.message,
      });

      return result.success;
    } finally {
      isRestoring.value = false;
    }
  };

  return {
    isRestoring: computed(() => isRestoring.value),
    executeRestoreApi,
  };
}
