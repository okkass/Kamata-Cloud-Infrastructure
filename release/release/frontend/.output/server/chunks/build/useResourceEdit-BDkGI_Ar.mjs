import { ref } from 'vue';
import { f as useNuxtApp } from './server.mjs';

const useResourceUpdate = (resourceName) => {
  const isUpdating = ref(false);
  const executeUpdate = async (id, payload) => {
    if (isUpdating.value) {
      console.warn("Update operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409
        }
      };
    }
    isUpdating.value = true;
    try {
      const responseData = await useNuxtApp().$apiFetch(
        `${resourceName}/${id}`,
        {
          method: "PUT",
          body: payload
        }
      );
      return { success: true, data: responseData };
    } catch (err) {
      const error = err;
      const statusCode = error.statusCode || 500;
      switch (statusCode) {
        case 400:
          return {
            success: false,
            error: {
              type: "validation",
              message: "入力内容に誤りがあります。",
              statusCode
            }
          };
        case 403:
          return {
            success: false,
            error: {
              type: "permission",
              message: "この操作を実行する権限がありません。",
              statusCode
            }
          };
        case 404:
          return {
            success: false,
            error: {
              type: "notFound",
              message: "更新対象のデータが見つかりませんでした。",
              statusCode
            }
          };
        default:
          return {
            success: false,
            error: {
              type: "unknown",
              message: `サーバーエラーが発生しました。(Code: ${statusCode})`,
              statusCode
            }
          };
      }
    } finally {
      isUpdating.value = false;
    }
  };
  return {
    executeUpdate,
    isUpdating
  };
};

export { useResourceUpdate as u };
//# sourceMappingURL=useResourceEdit-BDkGI_Ar.mjs.map
