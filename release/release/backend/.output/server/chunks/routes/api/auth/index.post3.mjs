import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
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
  var _a;
  const body = await readBody(event);
  const parseResult = refreshSchema.safeParse(body);
  if (!parseResult.success) {
    console.error("Invalid refresh request:", parseResult.error);
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body"
    });
  }
  const req = parseResult.data;
  const authService = getAuthService();
  const result = await authService.refresh(req);
  if (!result.success) {
    if (((_a = result.error) == null ? void 0 : _a.reason) === "Unauthorized") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    } else {
      console.error("Token refresh failed:", result.error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error"
      });
    }
  }
  return result.data;
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map
