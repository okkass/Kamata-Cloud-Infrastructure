import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import { SecurityGroupPatchRequest } from "@@/shared/types";
import { partialUpdateSecurityGroupSchema } from "@@/server/zodSchemas";

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
