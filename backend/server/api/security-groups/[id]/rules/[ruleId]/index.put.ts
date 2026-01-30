import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { SecurityRulePutRequest } from "@app/shared/types";
import { updateSecurityGroupRuleSchema } from "@/zodSchemas";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const { id, ruleId } = event.context.params as { id: string; ruleId: string };

  validateUUID(id);

  const service =
    await getSecurityGroupService(permission).getSecurityRuleService(id);

  return updateResource(
    ruleId,
    body as SecurityRulePutRequest,
    updateSecurityGroupRuleSchema,
    service.update,
  );
});
