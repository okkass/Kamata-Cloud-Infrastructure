import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../../../nitro/nitro.mjs';
import { v as validateUUID, c as createResource } from '../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../_/permission.mjs';
import { g as getSecurityGroupService } from '../../../../_/SecurityGroupService.mjs';
import { c as createSecurityGroupRuleSchema } from '../../../../_/securityGroup.mjs';
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
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params;
  validateUUID(id);
  const service = await getSecurityGroupService(permission).getSecurityRuleService(id);
  const body = await readBody(event);
  setResponseStatus(event, 201);
  return createResource(
    body,
    createSecurityGroupRuleSchema,
    service.create
  );
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
