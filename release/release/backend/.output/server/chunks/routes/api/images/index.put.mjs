import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { u as updateResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getImageService } from '../../../_/ImageService.mjs';
import { u as updateImageSchema } from '../../../_/image.mjs';
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
import '../../../_/mathUtils.mjs';
import '../../../_/StoragePoolService.mjs';
import '../../../_/NodeService.mjs';

const index_put = defineEventHandler(async (event) => {
  getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getImageService();
  const { id } = event.context.params;
  return updateResource(
    id,
    body,
    updateImageSchema,
    service.update
  );
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
