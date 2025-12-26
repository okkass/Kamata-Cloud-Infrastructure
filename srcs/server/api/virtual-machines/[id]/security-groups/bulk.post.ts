import { bulkResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { validateUUID } from "@@/server/utils/validate";
import { z } from "zod";
import type { BulkRequest } from "@@/server/types/BulkRequest";
import type { VmSecurityGroupAddRequest } from "@@/server/types";
import { createVmSecurityGroupSchema } from "@@/server/zodSchemas";

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
