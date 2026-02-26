import { d as defineEventHandler, g as getTokenFromEvent, f as fetchUserMe, r as readBody, u as useRuntimeConfig, e as setTokenCookie, h as setRefreshTokenCookie, F as FetchError, i as sendApiError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';

const login_post = defineEventHandler(async (event) => {
  var _a;
  const token = getTokenFromEvent(event);
  if (token) {
    const user = await fetchUserMe(token);
    if (user) {
      return { success: true };
    }
  }
  const body = await readBody(event);
  const baseUrl = useRuntimeConfig().public.backendUrl;
  const url = `${baseUrl}auth/login`;
  try {
    const response = await $fetch(url, {
      method: "POST",
      body
    });
    setTokenCookie(event, response.token);
    setRefreshTokenCookie(event, response.refreshToken);
    return { success: true };
  } catch (error) {
    if (error instanceof FetchError) {
      return sendApiError(event, (_a = error.response) == null ? void 0 : _a._data);
    }
    throw error;
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
