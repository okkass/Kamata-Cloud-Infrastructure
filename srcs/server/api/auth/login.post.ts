import type {
  LoginRequest,
  LoginResponse,
  ErrorResponse,
} from "~~/shared/types/api-types";
import { FetchError } from "ofetch";
export default defineEventHandler(async (event) => {
  // すでにログイン済みか確認
  const token = getTokenFromEvent(event);
  if (token) {
    // トークンがあれば有効確認へ
    const user = await fetchUserMe(token);
    if (user) {
      // すでにログイン済みなら成功
      return { success: true };
    }
  }

  // ここからログイン処理
  const body = await readBody<LoginRequest>(event);
  const baseUrl = useRuntimeConfig().public.backendUrl;
  const url = `${baseUrl}auth/login`;

  try {
    const response = await $fetch<LoginResponse>(url, {
      method: "POST",
      body: body,
    });
    // トークンとリフレッシュトークンをクッキーにセット
    setTokenCookie(event, response.token);
    setRefreshTokenCookie(event, response.refreshToken);
    return { success: true };
  } catch (error) {
    if (error instanceof FetchError) {
      return sendApiError(event, error.response?._data as ErrorResponse);
    }
  }
});
