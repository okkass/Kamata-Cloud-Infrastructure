import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { SecurityRulePatchRequest } from "@app/shared/types";
import { partialUpdateSecurityGroupRuleSchema } from "@/zodSchemas";
import { validateUUID } from "@/utils/validate";

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
