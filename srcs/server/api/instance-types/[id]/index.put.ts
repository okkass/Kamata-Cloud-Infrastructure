import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getInstanceTypeService } from "@@/server/service/InstanceTypeService";
import { InstanceTypePutRequest } from "@@/shared/types";
import { updateInstanceTypeSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getInstanceTypeService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as InstanceTypePutRequest,
    updateInstanceTypeSchema,
    service.update
  );
});
