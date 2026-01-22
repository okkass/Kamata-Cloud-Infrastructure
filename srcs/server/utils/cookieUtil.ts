import type { H3Event } from "h3";

const COOKIE_TOKEN_KEY = "token";
const COOKIE_REFRESH_TOKEN_KEY = "refreshToken";

const COOKIE_TOKEN_OPTIONS = {
  maxAge: 60 * 15, // 15分
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

const COOKIE_REFRESH_TOKEN_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30, // 30日
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

// イベントからクッキーを取得し、トークンを返す
export const getTokenFromEvent = (event: H3Event): string | null => {
  const cookie = getCookie(event, COOKIE_TOKEN_KEY);
  return cookie || null;
};

// イベントとトークンからクッキーを設定する
export const setTokenCookie = (event: H3Event, token: string): void => {
  setCookie(event, COOKIE_TOKEN_KEY, token, COOKIE_TOKEN_OPTIONS);
};

// クッキーからトークンを削除する
export const deleteTokenCookie = (event: H3Event): void => {
  deleteCookie(event, COOKIE_TOKEN_KEY);
};

// イベントからリフレッシュトークンを取得し、返す
export const getRefreshTokenFromEvent = (event: H3Event): string | null => {
  const cookie = getCookie(event, COOKIE_REFRESH_TOKEN_KEY);
  return cookie || null;
};

// イベントとリフレッシュトークンからクッキーを設定する
export const setRefreshTokenCookie = (
  event: H3Event,
  refreshToken: string,
): void => {
  setCookie(
    event,
    COOKIE_REFRESH_TOKEN_KEY,
    refreshToken,
    COOKIE_REFRESH_TOKEN_OPTIONS,
  );
};

// クッキーからリフレッシュトークンを削除する
export const deleteRefreshTokenCookie = (event: H3Event): void => {
  deleteCookie(event, COOKIE_REFRESH_TOKEN_KEY);
};
