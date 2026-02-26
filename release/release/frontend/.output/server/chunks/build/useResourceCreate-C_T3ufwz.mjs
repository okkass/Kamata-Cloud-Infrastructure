import { ref } from 'vue';
import { f as useNuxtApp } from './server.mjs';

const useResourceCreate = (resourceName) => {
  const isCreating = ref(false);
  const executeCreate = async (payload) => {
    if (isCreating.value) {
      console.warn("Create operation is already in progress.");
      return {
        success: false,
        error: {
          type: "conflict",
          message: "処理が重複しています。",
          statusCode: 409
        }
      };
    }
    isCreating.value = true;
    try {
      const responseData = await useNuxtApp().$apiFetch(
        `${resourceName}`,
        {
          method: "POST",
          body: payload
        }
      );
      console.log(responseData);
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
      isCreating.value = false;
    }
  };
  return {
    executeCreate,
    isCreating
  };
};

export { useResourceCreate as u };
//# sourceMappingURL=useResourceCreate-C_T3ufwz.mjs.map
