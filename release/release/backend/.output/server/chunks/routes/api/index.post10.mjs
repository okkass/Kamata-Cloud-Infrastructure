import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../nitro/nitro.mjs';
import { c as createResource } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../_/VirtualNetworkService.mjs';
import { d as createVirtualNetworkSchema } from '../../_/virtualNetwork.mjs';
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
  const body = await readBody(event);
  const service = getVirtualNetworkService(permission);
  setResponseStatus(event, 201);
  return createResource(
    body,
    createVirtualNetworkSchema,
    service.create
  );
});

export { index_post as default };
//# sourceMappingURL=index.post10.mjs.map
