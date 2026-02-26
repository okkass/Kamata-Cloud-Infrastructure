import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler((event) => {
  throw createError({
    statusCode: 501,
    statusMessage: "Not Implemented"
  });
});

export { index_get as default };
//# sourceMappingURL=index.get7.mjs.map
