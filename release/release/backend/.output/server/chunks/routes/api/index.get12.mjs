import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { a as getResourceList } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../_/VirtualMachineService.mjs';
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
import '../../_/InstanceTypeService.mjs';
import '../../_/mathUtils.mjs';
import '../../_/VirtualMachineRepository.mjs';
import '../../_/NodeService.mjs';
import '../../_/SecurityGroupService.mjs';
import '../../_/StoragePoolService.mjs';
import '../../_/VirtualNetworkService.mjs';

const index_get = defineEventHandler((event) => {
  const { scope } = getQuery(event);
  if (scope !== void 0 && scope !== "all" && scope !== "mine") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid scope parameter"
    });
  }
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);
  return getResourceList(service.list);
});

export { index_get as default };
//# sourceMappingURL=index.get12.mjs.map
