import { d as defineEventHandler } from '../../../../nitro/nitro.mjs';
import { v as validateUUID, a as getResourceList } from '../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../../_/VirtualNetworkService.mjs';
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

const index_get = defineEventHandler((event) => {
  var _a;
  const vnId = validateUUID((_a = event.context.params) == null ? void 0 : _a.id);
  const permission = getPermissionFromEvent(event);
  const service = getVirtualNetworkService(permission).getSubnetService(vnId);
  return getResourceList(service.list);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
