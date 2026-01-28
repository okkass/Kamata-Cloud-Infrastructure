import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, ruleId } = event.context.params as { id: string; ruleId: string };
  validateUUID(id);
  const service =
    await getSecurityGroupService(permission).getSecurityRuleService(id);

  return deleteResource(ruleId, service.delete);
});
