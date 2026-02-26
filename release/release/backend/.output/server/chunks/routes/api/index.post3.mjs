import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../nitro/nitro.mjs';
import { c as createResource } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getInstanceTypeService } from '../../_/InstanceTypeService.mjs';
import { c as createInstanceTypeSchema } from '../../_/instanceType.mjs';
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

const index_post = defineEventHandler(async (event) => {
  getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getInstanceTypeService();
  setResponseStatus(event, 201);
  return createResource(
    body,
    createInstanceTypeSchema,
    service.create
  );
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map
