import { d as defineEventHandler, c as createError, r as readBody } from '../../../../../nitro/nitro.mjs';
import { v as validateUUID, u as updateResource } from '../../../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../../../../_/VirtualMachineService.mjs';
import { a as partialUpdateNetworkInterfaceSchema } from '../../../../../_/virtualMachine.mjs';
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

const index_patch = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, nicId } = event.context.params;
  validateUUID(id);
  const service = getVirtualMachineService(permission).getNetworkInterfaceService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found"
    });
  }
  const body = await readBody(event);
  return updateResource(
    nicId,
    body,
    partialUpdateNetworkInterfaceSchema,
    service.update
  );
});

export { index_patch as default };
//# sourceMappingURL=index.patch.mjs.map
