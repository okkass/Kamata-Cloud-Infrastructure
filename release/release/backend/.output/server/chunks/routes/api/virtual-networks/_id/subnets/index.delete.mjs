import { d as defineEventHandler } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, d as deleteResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getVirtualNetworkService } from '../../../../../_/VirtualNetworkService.mjs';
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

const index_delete = defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const { id, subnetId } = event.context.params;
  validateUUID(id);
  const service = getVirtualNetworkService(permission).getSubnetService(id);
  return deleteResource(subnetId, service.delete);
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
