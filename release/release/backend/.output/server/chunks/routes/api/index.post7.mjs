import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../nitro/nitro.mjs';
import { c as createResource } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getStoragePoolService } from '../../_/StoragePoolService.mjs';
import { c as createStoragePoolSchema } from '../../_/storagePool.mjs';
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
import '../../_/mathUtils.mjs';
import '../../_/NodeService.mjs';

const index_post = defineEventHandler(async (event) => {
  getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getStoragePoolService();
  setResponseStatus(event, 201);
  return createResource(
    body,
    createStoragePoolSchema,
    service.create
  );
});

export { index_post as default };
//# sourceMappingURL=index.post7.mjs.map
