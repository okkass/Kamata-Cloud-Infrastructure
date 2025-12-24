import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getInstanceTypeService } from "@/service/InstanceTypeService";
import { InstanceTypePutRequest } from "@app/shared/types";
import { updateInstanceTypeSchema } from "@/zodSchemas";

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
