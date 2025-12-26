import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getInstanceTypeService } from "@@/server/service/InstanceTypeService";
import { InstanceTypeCreateRequest } from "@@/shared/types";
import { createInstanceTypeSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getInstanceTypeService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as InstanceTypeCreateRequest,
    createInstanceTypeSchema,
    service.create
  );
});
