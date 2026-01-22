import type { LoginResponse, UserResponse } from "~~/shared/types/api-types";
import { FetchError } from "ofetch";

export const fetchRefreshToken = async (
  refreshToken: string,
): Promise<LoginResponse | null> => {
  const baseUrl = useRuntimeConfig().public.backendUrl;
  const url = `${baseUrl}auth/refresh`;

  try {
    const response = await $fetch<LoginResponse>(url, {
      method: "POST",
      body: { refreshToken },
    });
    return response;
  } catch (error) {
    // 401じゃないときだけログに出す
    if (
      error instanceof FetchError &&
      (error as FetchError).response?.status !== 401
    ) {
      console.error("リフレッシュトークンの更新に失敗:", error);
    }
    return null;
  }
};

export const fetchUserMe = async (
  token: string,
): Promise<UserResponse | null> => {
  const baseUrl = useRuntimeConfig().public.backendUrl;
  const url = `${baseUrl}users/me`;

  try {
    const response = await $fetch<UserResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    // 401じゃないときだけログに出す
    if (
      error instanceof FetchError &&
      (error as FetchError).response?.status !== 401
    ) {
      console.error("ユーザー情報の取得に失敗:", error);
    }
    return null;
  }
};
