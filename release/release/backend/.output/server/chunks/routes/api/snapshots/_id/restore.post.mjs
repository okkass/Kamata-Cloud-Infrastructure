import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
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

const restore_post = defineEventHandler(async (event) => {
  throw createError({
    statusCode: 501,
    statusMessage: "Not Implemented"
  });
});

export { restore_post as default };
//# sourceMappingURL=restore.post.mjs.map
