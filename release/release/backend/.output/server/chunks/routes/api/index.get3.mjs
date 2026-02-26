import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { a as getResourceList } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getImageService } from '../../_/ImageService.mjs';
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
import '../../_/StoragePoolService.mjs';
import '../../_/NodeService.mjs';

const index_get = defineEventHandler((event) => {
  getPermissionFromEvent(event);
  const service = getImageService();
  return getResourceList(service.list);
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map
