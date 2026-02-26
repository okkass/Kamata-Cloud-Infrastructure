import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { u as updateResource } from '../../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../../_/VirtualMachineService.mjs';
import { u as updateVirtualMachineSchema } from '../../../_/virtualMachine.mjs';
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
import '../../../_/InstanceTypeService.mjs';
import '../../../_/mathUtils.mjs';
import '../../../_/VirtualMachineRepository.mjs';
import '../../../_/NodeService.mjs';
import '../../../_/SecurityGroupService.mjs';
import '../../../_/StoragePoolService.mjs';
import '../../../_/VirtualNetworkService.mjs';

const index_put = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);
  const { id } = event.context.params;
  const body = await readBody(event);
  return updateResource(
    id,
    body,
    updateVirtualMachineSchema,
    service.update
  );
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
