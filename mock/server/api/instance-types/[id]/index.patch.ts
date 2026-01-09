import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getInstanceTypeService } from "@/service/InstanceTypeService";
import { InstanceTypePatchRequest } from "@app/shared/types";
import { partialUpdateInstanceTypeSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getInstanceTypeService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as InstanceTypePatchRequest,
    partialUpdateInstanceTypeSchema,
    service.update
  );
});
