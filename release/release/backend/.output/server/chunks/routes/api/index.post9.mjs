import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../nitro/nitro.mjs';
import { c as createResource } from '../../_/serviceResultHandler.mjs';
import { g as getPermissionFromEvent } from '../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../_/VirtualMachineService.mjs';
import { h as createVirtualMachineSchema } from '../../_/virtualMachine.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);
  const body = await readBody(event);
  console.log("Creating virtual machine with body:", body);
  setResponseStatus(event, 201);
  return createResource(
    body,
    createVirtualMachineSchema,
    service.create
  );
});

export { index_post as default };
//# sourceMappingURL=index.post9.mjs.map
