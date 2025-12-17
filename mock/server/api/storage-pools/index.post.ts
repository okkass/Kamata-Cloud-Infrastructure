import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getStoragePoolService } from "@/service/StoragePoolService";
import { createStoragePoolSchema } from "@/zodSchemas";
import { StoragePoolCreateRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getStoragePoolService(permission);

  return createResource(
    body as StoragePoolCreateRequest,
    createStoragePoolSchema,
    service.create
  );
});
