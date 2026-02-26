import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { g as getResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getNodeService } from '../../../_/NodeService.mjs';
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

const index_get = defineEventHandler((event) => {
  getPermissionFromEvent(event);
  const service = getNodeService();
  const { id } = event.context.params;
  return getResource(id, service.getById);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
