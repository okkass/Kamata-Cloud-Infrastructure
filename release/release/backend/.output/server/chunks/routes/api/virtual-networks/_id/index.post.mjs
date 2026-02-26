import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../../../nitro/nitro.mjs';
import { v as validateUUID, c as createResource } from '../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../../_/VirtualNetworkService.mjs';
import { c as createSubnetSchema } from '../../../../_/virtualNetwork.mjs';
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
  var _a;
  const vnId = validateUUID((_a = event.context.params) == null ? void 0 : _a.id);
  const requestBody = await readBody(event);
  const permission = getPermissionFromEvent(event);
  const service = getVirtualNetworkService(permission).getSubnetService(vnId);
  setResponseStatus(event, 201);
  return createResource(requestBody, createSubnetSchema, service.create);
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
