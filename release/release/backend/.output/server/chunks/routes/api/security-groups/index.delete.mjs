import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { d as deleteResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getSecurityGroupService } from '../../../_/SecurityGroupService.mjs';
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
  const permission = getPermissionFromEvent(event);
  const service = getSecurityGroupService(permission);
  const { id } = event.context.params;
  return deleteResource(id, service.delete);
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
