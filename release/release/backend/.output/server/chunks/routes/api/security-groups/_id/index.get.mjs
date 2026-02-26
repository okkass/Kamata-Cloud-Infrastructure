import { d as defineEventHandler } from '../../../../nitro/nitro.mjs';
import { v as validateUUID, a as getResourceList } from '../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../_/permission.mjs';
import { g as getSecurityGroupService } from '../../../../_/SecurityGroupService.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params;
  validateUUID(id);
  const service = await getSecurityGroupService(permission).getSecurityRuleService(id);
  return getResourceList(service.list);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
