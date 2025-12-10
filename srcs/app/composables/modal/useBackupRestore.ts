import { ref } from "vue";
import { useToast } from "~/composables/useToast";
import { useResourceCreate } from "~/composables/useResourceCreate";

export function useBackupRestore() {
  const { addToast } = useToast();
  const isRestoring = ref(false);

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
      if (result.success) {
        addToast({
          type: "success",
          message: `バックアップ「${name}」からの復元を開始しました。`,
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
