import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import { SecurityRulePatchRequest } from "@@/shared/types";
import { partialUpdateSecurityGroupRuleSchema } from "@@/server/zodSchemas";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const { id, ruleId } = event.context.params as { id: string; ruleId: string };

  validateUUID(id);

  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  return updateResource(
    ruleId,
    body as SecurityRulePatchRequest,
    partialUpdateSecurityGroupRuleSchema,
    service.update
  );
});
