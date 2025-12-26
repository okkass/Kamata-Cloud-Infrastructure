import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { validateUUID } from "@@/server/utils/validate";
import { createStorageSchema } from "@@/server/zodSchemas";
import type { StorageCreateRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service = getVirtualMachineService(permission).getStorageService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  const body = await readBody<StorageCreateRequest>(event);
  setResponseStatus(event, 201);
  return createResource(
    body as StorageCreateRequest,
    createStorageSchema,
    service.create
  );
});
