import { d as defineEventHandler, c as createError, s as setResponseStatus } from '../../../../nitro/nitro.mjs';
import { g as getPermissionFromEvent } from '../../../../_/permission.mjs';
import { g as getVirtualMachineService } from '../../../../_/VirtualMachineService.mjs';
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
import '../../../../_/InstanceTypeService.mjs';
import '../../../../_/mathUtils.mjs';
import '../../../../_/VirtualMachineRepository.mjs';
import '../../../../_/NodeService.mjs';
import '../../../../_/SecurityGroupService.mjs';
import '../../../../_/StoragePoolService.mjs';
import '../../../../_/VirtualNetworkService.mjs';

const reboot_post = defineEventHandler(async (event) => {
  const permissions = getPermissionFromEvent(event);
  const { id } = event.context.params;
  const service = getVirtualMachineService(permissions).getPowerService(id);
  const res = await service.reboot();
  if (!res.success) {
    throw createError({
      statusCode: 500,
      statusMessage: res.error.message ? `${res.error.reason}: ${res.error.message}` : res.error.reason
    });
  }
  setResponseStatus(event, 202);
  return { message: "Reboot initiated" };
});

export { reboot_post as default };
//# sourceMappingURL=reboot.post.mjs.map
