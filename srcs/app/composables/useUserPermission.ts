import type { UserPermissions } from "~~/shared/types";
import type { UserResponse } from "~~/shared/types";

export const useUserPermission = () => {
  // NuxtのuseStateを使い、ユーザー情報をアプリ全体で共有・保持する
  const user = useState<UserPermissions | null>("user", () => null);

  // isAdminの状態を算出プロパティとして定義
  const isAdmin = computed(() => {
    // ユーザー情報がなければfalse
    if (!user.value) return false;

    // isAdminプロパティがtrueかどうかを安全にチェック
    return user.value.isAdmin === true;
  });

  const isImageAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isImageAdmin === true;
  });

  const isInstanceTypeAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isInstanceTypeAdmin === true;
  });

  const isNetworkAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isNetworkAdmin === true;
  });

  const isNodeAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isNodeAdmin === true;
  });

  const isSecurityGroupAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isSecurityGroupAdmin === true;
  });

  const isVirtualMachineAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.isVirtualMachineAdmin === true;
  });

  // ユーザー情報を取得する非同期関数
  const fetchUser = async () => {
    // 既にユーザー情報があれば再取得しない
    if (user.value !== null) return;

    try {
      const { data } = await useFetch("users/me", {
        $fetch: useNuxtApp().$apiFetch,
      });
      const res = data.value as UserResponse;
      user.value = {
        id: res.id,
        isAdmin: res.isAdmin,
        isImageAdmin: res.isImageAdmin,
        isInstanceTypeAdmin: res.isInstanceTypeAdmin,
        isNetworkAdmin: res.isNetworkAdmin,
        isNodeAdmin: res.isNodeAdmin,
        isSecurityGroupAdmin: res.isSecurityGroupAdmin,
        isVirtualMachineAdmin: res.isVirtualMachineAdmin,
      };
    } catch (error) {
      console.error("Failed to fetch user:", error);
      user.value = null; // エラー時はnullに設定
    }
  };

  return {
    user,
    isAdmin,
    isImageAdmin,
    isInstanceTypeAdmin,
    isNetworkAdmin,
    isNodeAdmin,
    isSecurityGroupAdmin,
    isVirtualMachineAdmin,
    fetchUser,
  };
};
