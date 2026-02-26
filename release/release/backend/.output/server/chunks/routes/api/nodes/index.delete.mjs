import { d as defineEventHandler, s as setResponseStatus } from '../../../nitro/nitro.mjs';
import { d as deleteResource } from '../../../_/serviceResultHandler.mjs';
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

const index_delete = defineEventHandler((event) => {
  getPermissionFromEvent(event);
  const service = getNodeService();
  const { id } = event.context.params;
  setResponseStatus(event, 204);
  return deleteResource(id, service.delete);
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
