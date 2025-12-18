import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import { SecurityRuleCreateRequest } from "@app/shared/types";
import { validateUUID } from "@/utils/validate";
import { createSecurityGroupRuleSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  const body = await readBody(event);

  return createResource(
    body as SecurityRuleCreateRequest,
    createSecurityGroupRuleSchema,
    service.create
  );
});
