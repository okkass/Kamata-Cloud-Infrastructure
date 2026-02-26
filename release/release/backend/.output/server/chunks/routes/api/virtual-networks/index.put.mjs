import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { u as updateResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../_/VirtualNetworkService.mjs';
import { u as updateVirtualNetworkSchema } from '../../../_/virtualNetwork.mjs';
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
  const { id } = event.context.params;
  const requestBody = await readBody(event);
  const service = getVirtualNetworkService(permission);
  return updateResource(
    id,
    requestBody,
    updateVirtualNetworkSchema,
    service.update
  );
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
