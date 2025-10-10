import { LoginPost200ResponseDTO } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const tokens = await $fetch<LoginPost200ResponseDTO>("/api/login", {
    method: "POST",
    body: {
      email: body.email,
      password: body.password,
    },
  });
  const accessToken = tokens.token;
  const refreshToken = tokens.refreshToken;

  const maxAgeAccess = 15 * 60; // 15 minutes
  const maxAgeRefresh = 7 * 24 * 60 * 60; // 7 days

  setCookie(event, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeAccess,
  });
  setCookie(event, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeRefresh,
  });

  return { message: "Login successful" };
});
