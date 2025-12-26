import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);

  const { id, storageId } = event.context.params as {
    id: string;
    storageId: string;
  };
  validateUUID(id);

  const service = getVirtualMachineService(permission).getStorageService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  return getResource(storageId, service.getById);
});
