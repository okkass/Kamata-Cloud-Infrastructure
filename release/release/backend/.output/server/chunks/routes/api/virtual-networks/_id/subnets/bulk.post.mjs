import { d as defineEventHandler, c as createError, r as readBody } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, b as bulkResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../../../_/VirtualNetworkService.mjs';
import { b as updateSubnetSchema, c as createSubnetSchema } from '../../../../../_/virtualNetwork.mjs';
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
  const service = getVirtualNetworkService(permission).getSubnetService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Network not found"
    });
  }
  const body = await readBody(event);
  return bulkResource(
    body,
    createSubnetSchema,
    updateSubnetSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});

export { bulk_post as default };
//# sourceMappingURL=bulk.post.mjs.map
