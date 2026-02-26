import { d as defineEventHandler, b as getUserService } from '../../../nitro/nitro.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getResource } from '../../../_/serviceResultHandler.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);
  return getResource(permission.id, service.getById);
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
