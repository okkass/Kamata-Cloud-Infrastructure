import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { SecurityGroupCreateRequest } from "@app/shared/types";
import { createSecurityGroupSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSecurityGroupService(permission);
  return createResource(
    body as SecurityGroupCreateRequest,
    createSecurityGroupSchema,
    service.create
  );
});
