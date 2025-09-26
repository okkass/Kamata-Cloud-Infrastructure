import { ref } from "vue";

/**
 * 汎用的なリソース削除Composable
 * @param resourceName - APIのエンドポイント名 (例: 'security-groups', 'virtual-machines')
 */
export const useResourceDelete = (resourceName: string) => {
  const isDeleting = ref(false);
  const error = ref<Error | null>(null);
  const success = ref<boolean>(false);

  /**
   * 削除を実行する関数
   * @param id - 削除するリソースのID
   */
  const executeDelete = async (
    id: string
  ): Promise<{ success?: boolean; error?: Error }> => {
    isDeleting.value = true;
    error.value = null;

    try {
      await $fetch(`/api/${resourceName}/${id}`, {
        method: "DELETE" as any,
      });
      console.log(`[${resourceName}] ID: ${id} の削除に成功しました。`);
      return {
        success: true,
      };
    } catch (e: any) {
      console.error(`[${resourceName}] ID: ${id} の削除に失敗しました。`, e);
      error.value = e;
      return {
        error: e,
      };
    } finally {
      isDeleting.value = false;
    }
  };

  return {
    executeDelete,
    isDeleting,
    error,
    success,
  };
};
