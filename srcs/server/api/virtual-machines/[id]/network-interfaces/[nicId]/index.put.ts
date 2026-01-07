import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { updateNetworkInterfaceSchema } from "@@/server/zodSchemas";
import type { NetworkInterfacePutRequest } from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, nicId } = event.context.params as { id: string; nicId: string };
  validateUUID(id);

  const service =
    getVirtualMachineService(permission).getNetworkInterfaceService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  const body = await readBody<NetworkInterfacePutRequest>(event);
  return updateResource(
    nicId,
    body as NetworkInterfacePutRequest,
    updateNetworkInterfaceSchema,
    service.update
  );
});
