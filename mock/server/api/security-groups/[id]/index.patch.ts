import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { SecurityGroupPatchRequest } from "@app/shared/types";
import { partialUpdateSecurityGroupSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSecurityGroupService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as SecurityGroupPatchRequest,
    partialUpdateSecurityGroupSchema,
    service.update
  );
});
