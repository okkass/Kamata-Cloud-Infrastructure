import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getInstanceTypeService } from "@/service/InstanceTypeService";
import { InstanceTypeCreateRequest } from "@app/shared/types";
import { createInstanceTypeSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getInstanceTypeService(permission);

  return createResource(
    body as InstanceTypeCreateRequest,
    createInstanceTypeSchema,
    service.create
  );
});
