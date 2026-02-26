import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../../nitro/nitro.mjs';
import { r as refreshSchema, g as getAuthService } from '../../../_/AuthService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import '@prisma/client/runtime/client';
import '@prisma/adapter-mariadb';
import 'argon2';
import 'zod';

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = refreshSchema.safeParse(body);
  if (!parseResult.success) {
    console.error("Invalid logout request body:", parseResult.error);
    return {
      status: 400,
      error: "Invalid request body"
    };
  }
  const { refreshToken } = parseResult.data;
  const authService = getAuthService();
  const result = await authService.logout(refreshToken);
  if (!result.success) {
    console.error("Logout failed:", result.error);
    return {
      status: 500,
      error: "Logout failed"
    };
  }
  setResponseStatus(event, 204);
  return;
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
