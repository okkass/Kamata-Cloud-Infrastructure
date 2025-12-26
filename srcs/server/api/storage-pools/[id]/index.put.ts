import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getStoragePoolService } from "@@/server/service/StoragePoolService";
import { updateStoragePoolSchema } from "@@/server/zodSchemas";
import { StoragePoolPutRequest } from "@@/shared/types";

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
