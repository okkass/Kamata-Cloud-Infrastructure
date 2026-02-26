import { d as defineEventHandler, r as readBody } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, b as bulkResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getSecurityGroupService } from '../../../../../_/SecurityGroupService.mjs';
import { b as updateSecurityGroupRuleSchema, c as createSecurityGroupRuleSchema } from '../../../../../_/securityGroup.mjs';
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

const bulk_post = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params;
  validateUUID(id);
  const service = await getSecurityGroupService(permission).getSecurityRuleService(id);
  const body = await readBody(event);
  return bulkResource(
    body,
    createSecurityGroupRuleSchema,
    updateSecurityGroupRuleSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});

export { bulk_post as default };
//# sourceMappingURL=bulk.post.mjs.map
