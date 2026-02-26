import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { u as updateResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getSecurityGroupService } from '../../../_/SecurityGroupService.mjs';
import { u as updateSecurityGroupSchema } from '../../../_/securityGroup.mjs';
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

const index_put = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSecurityGroupService(permission);
  const { id } = event.context.params;
  return updateResource(
    id,
    body,
    updateSecurityGroupSchema,
    service.update
  );
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
