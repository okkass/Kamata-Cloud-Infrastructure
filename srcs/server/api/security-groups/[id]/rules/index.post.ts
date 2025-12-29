import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import type { SecurityRuleCreateRequest } from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";
import { createSecurityGroupRuleSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  const body = await readBody(event);

  setResponseStatus(event, 201);
  return createResource(
    body as SecurityRuleCreateRequest,
    createSecurityGroupRuleSchema,
    service.create
  );
});
