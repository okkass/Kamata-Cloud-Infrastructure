import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { updateStorageSchema } from "@/zodSchemas";
import type { StoragePutRequest } from "@app/shared/types";
import { validateUUID } from "@/utils/validate";

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
