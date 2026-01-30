import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);

  const { id, ruleId } = event.context.params as { id: string; ruleId: string };
  const service =
    await getSecurityGroupService(permission).getSecurityRuleService(id);

  return getResource(ruleId, service.getById);
});
