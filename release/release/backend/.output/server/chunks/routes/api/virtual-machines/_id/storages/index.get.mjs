import { d as defineEventHandler, c as createError } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, g as getResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../../../../_/VirtualMachineService.mjs';
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
import '../../../../../_/InstanceTypeService.mjs';
import '../../../../../_/mathUtils.mjs';
import '../../../../../_/VirtualMachineRepository.mjs';
import '../../../../../_/NodeService.mjs';
import '../../../../../_/SecurityGroupService.mjs';
import '../../../../../_/StoragePoolService.mjs';
import '../../../../../_/VirtualNetworkService.mjs';

const index_get = defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const { id, storageId } = event.context.params;
  validateUUID(id);
  const service = getVirtualMachineService(permission).getStorageService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found"
    });
  }
  return getResource(storageId, service.getById);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
