import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { updateStorageSchema } from "@@/server/zodSchemas";
import type { StoragePutRequest } from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler(async (event) => {
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

  const body = await readBody<StoragePutRequest>(event);
  return updateResource(
    storageId,
    body as StoragePutRequest,
    updateStorageSchema,
    service.update
  );
});
