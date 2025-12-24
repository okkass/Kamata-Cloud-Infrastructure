import { bulkResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import type {
  NetworkInterfaceCreateRequest,
  NetworkInterfacePatchRequest,
} from "@app/shared/types";
import { validateUUID } from "@/utils/validate";
import {
  createNetworkInterfaceSchema,
  updateNetworkInterfaceSchema,
} from "@/zodSchemas";
import type { BulkRequest } from "@/types/BulkRequest";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getVirtualMachineService(permission).getNetworkInterfaceService(id);

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  const body = (await readBody(event)) as BulkRequest<
    NetworkInterfaceCreateRequest,
    NetworkInterfacePatchRequest
  >;
  return bulkResource(
    body,
    createNetworkInterfaceSchema,
    updateNetworkInterfaceSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});
