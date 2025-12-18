/**
 * =================================================================================
 * スナップショット復元ロジック (useSnapshotRestore.ts)
 * =================================================================================
 */
import { ref } from "vue";
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
    // エンドポイント: /api/snapshots/{id}/restore
    const { executeCreate } = useResourceCreate<
      Record<string, never>,
      VirtualMachineResponse
    >(`snapshots/${id}/restore`);

    isRestoring.value = true;
    try {
      // ペイロードは空（IDはURLに含まれるため）
      const result = await executeCreate({});

      if (result.success) {
        addToast({
          type: "success",
          message: `スナップショット「${name}」からの復元を開始しました。`,
        });
        return true;
      } else {
        addToast({
          type: "error",
          message: "復元に失敗しました。",
          details: result.error?.message,
        });
        return false;
      }
    } finally {
      isRestoring.value = false;
    }
  };

  return {
    isRestoring,
    executeRestoreApi,
  };
}
