import { d as defineEventHandler, j as deleteTokenCookie, k as getRefreshTokenFromEvent, u as useRuntimeConfig, l as deleteRefreshTokenCookie } from '../../../nitro/nitro.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  deleteTokenCookie(event);
  const refreshToken = getRefreshTokenFromEvent(event);
  if (refreshToken) {
    const baseUrl = useRuntimeConfig().public.backendUrl;
    const url = `${baseUrl}auth/logout`;
    try {
      await $fetch(url, {
        method: "POST",
        body: { refreshToken }
      });
    } catch (error) {
      console.error("\u30ED\u30B0\u30A2\u30A6\u30C8\u901A\u77E5\u306B\u5931\u6557:", error);
    }
  }
  deleteRefreshTokenCookie(event);
  return { success: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
