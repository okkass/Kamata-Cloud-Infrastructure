import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getStoragePoolService } from "@@/server/service/StoragePoolService";
import { createStoragePoolSchema } from "@@/server/zodSchemas";
import { StoragePoolCreateRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getStoragePoolService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as StoragePoolCreateRequest,
    createStoragePoolSchema,
    service.create
  );
});
