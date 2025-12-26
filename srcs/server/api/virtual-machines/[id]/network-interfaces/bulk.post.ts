import { bulkResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import type {
  NetworkInterfaceCreateRequest,
  NetworkInterfacePatchRequest,
} from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";
import {
  createNetworkInterfaceSchema,
  updateNetworkInterfaceSchema,
} from "@@/server/zodSchemas";
import type { BulkRequest } from "@@/server/types/BulkRequest";

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
