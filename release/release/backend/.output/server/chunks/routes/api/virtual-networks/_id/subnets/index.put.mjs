import { d as defineEventHandler, r as readBody } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, u as updateResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../../../_/VirtualNetworkService.mjs';
import { b as updateSubnetSchema } from '../../../../../_/virtualNetwork.mjs';
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
  const { id, subnetId } = event.context.params;
  validateUUID(id);
  const service = getVirtualNetworkService(permission).getSubnetService(id);
  const requestBody = await readBody(event);
  return updateResource(
    subnetId,
    requestBody,
    updateSubnetSchema,
    service.update
  );
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
