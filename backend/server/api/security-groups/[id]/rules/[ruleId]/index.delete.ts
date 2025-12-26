import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const { id, ruleId } = event.context.params as { id: string; ruleId: string };
  validateUUID(id);
  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  return deleteResource(ruleId, service.delete);
});
