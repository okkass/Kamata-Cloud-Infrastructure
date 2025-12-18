import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { validateUUID } from "@/utils/validate";
import { createVmSecurityGroupSchema } from "@/zodSchemas";
import type { VmSecurityGroupAddRequest } from "@/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getVirtualMachineService(permission).getVmSecurityGroupService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  const body = await readBody<VmSecurityGroupAddRequest>(event);
  return createResource(
    body as VmSecurityGroupAddRequest,
    createVmSecurityGroupSchema,
    service.create
  );
});
