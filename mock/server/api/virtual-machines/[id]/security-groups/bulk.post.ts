import { bulkResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { validateUUID } from "@/utils/validate";
import { never, z } from "zod";
import type { BulkRequest } from "@/types/BulkRequest";
import type { VmSecurityGroupAddRequest } from "@/types";
import { createVmSecurityGroupSchema } from "@/zodSchemas";

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

  const body = (await readBody(event)) as BulkRequest<
    VmSecurityGroupAddRequest,
    never
  >;

  return bulkResource(
    body,
    createVmSecurityGroupSchema,
    z.never(),
    service.create,
    null,
    service.delete,
    service.list
  );
});
