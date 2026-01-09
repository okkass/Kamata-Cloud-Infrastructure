/**
 * =================================================================================
 * スナップショット復元ロジック (useSnapshotRestore.ts)
 * =================================================================================
 */
import { computed, ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

export function useSnapshotRestore() {
  const { addToast } = useToast();
  const isRestoring = ref(false);

  /**
   * スナップショット復元APIを実行する
   * @param id スナップショットID
   * @param name スナップショット名（トースト表示用）
   */
  const executeRestoreApi = async (
    id: string,
    name: string
  ): Promise<boolean> => {
    const { executeCreate } = useResourceCreate<
      Record<string, never>,
      VirtualMachineResponse
    >(`snapshots/${id}/restore`);

    isRestoring.value = true;
    try {
      const result = await executeCreate({});

      addToast({
        type: result.success ? "success" : "error",
        message: result.success
          ? `スナップショット「${name}」からの復元を開始しました。`
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
