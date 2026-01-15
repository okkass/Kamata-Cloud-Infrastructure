import type { UserPermissions } from "~~/shared/types";
import type { UserResponse } from "~~/shared/types";

/**
 * ログインユーザーの権限フラグを共有し、API から一度だけ取得するためのコンポーザブル。
 * 取得済みなら再フェッチを避け、`useState` でタブ内共有する。
 */
export const useUserPermission = () => {
  // NuxtのuseStateを使い、ユーザー情報をアプリ全体で共有・保持する
  const user = useState<UserPermissions | null>("user", () => null);

  // isAdminの状態を算出プロパティとして定義
  const isAdmin = computed(() => {
    if (!user.value) {
      return false;
    }

    // isAdminプロパティがtrueかどうかを安全にチェック
    return user.value.isAdmin === true;
  });

  const isImageAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isImageAdmin === true;
  });

  const isInstanceTypeAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isInstanceTypeAdmin === true;
  });

  const isNetworkAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isNetworkAdmin === true;
  });

  const isNodeAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isNodeAdmin === true;
  });

  const isSecurityGroupAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isSecurityGroupAdmin === true;
  });

  const isVirtualMachineAdmin = computed(() => {
    if (!user.value) {
      return false;
    }
    return user.value.isVirtualMachineAdmin === true;
  });

  /**
   * 何らかの管理者権限を持っているかどうかを判定
   * isAdmin が true、または他の admin 権限のいずれかが true の場合に true を返す
   */
  const hasAdminAccess = computed(() => {
    return (
      isAdmin.value ||
      isImageAdmin.value ||
      isInstanceTypeAdmin.value ||
      isNetworkAdmin.value ||
      isNodeAdmin.value ||
      isSecurityGroupAdmin.value ||
      isVirtualMachineAdmin.value
    );
  });

  /**
   * ユーザー情報を API から取得して保持する。
   * 既に保持済みの場合は再取得しない。
   */
  const fetchUser = async () => {
    console.log("fetchUser called. Current user state:", user.value);
    // 既にユーザー情報があれば再取得しない
    if (user.value !== null) return;

    const config = useRuntimeConfig();
    // console.log("Permission Debug: apiBaseUrl is", config.public.apiBaseUrl);

    try {
      // useFetch は setup 直下以外で使うと挙動が不安定になるため、
      // 関数内では直接 $apiFetch を使用してデータを取得する
      // console.log("Permission Debug: Executing $apiFetch...");

      const res = await useNuxtApp().$apiFetch<UserResponse>("users/me");

      // console.log("Permission Debug: $apiFetch success", res);

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
    hasAdminAccess,
    fetchUser,
  };
};
