import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);

  const { id, ruleId } = event.context.params as { id: string; ruleId: string };
  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  return getResource(ruleId, service.getById);
});
