import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getStoragePoolService } from "@/service/StoragePoolService";
import { updateStoragePoolSchema } from "@/zodSchemas";
import { StoragePoolPutRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getStoragePoolService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as StoragePoolPutRequest,
    updateStoragePoolSchema,
    service.update
  );
});
