import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getStoragePoolService } from "@/service/StoragePoolService";
import { StoragePoolPatchRequest } from "@app/shared/types";
import { partialUpdateStoragePoolSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getStoragePoolService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as StoragePoolPatchRequest,
    partialUpdateStoragePoolSchema,
    service.update
  );
});
