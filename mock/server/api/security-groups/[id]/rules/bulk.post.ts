import { bulkResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSecurityGroupService } from "@/service/SecurityGroupService";
import type {
  SecurityRuleCreateRequest,
  SecurityRulePatchRequest,
} from "@app/shared/types";
import { validateUUID } from "@/utils/validate";
import {
  createSecurityGroupRuleSchema,
  partialUpdateSecurityGroupRuleSchema,
} from "@/zodSchemas";
import type { BulkRequest } from "@/types/BulkRequest";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getSecurityGroupService(permission).getSecurityRuleService(id);

  const body = (await readBody(event)) as BulkRequest<
    SecurityRuleCreateRequest,
    SecurityRulePatchRequest
  >;
  return bulkResource(
    body,
    createSecurityGroupRuleSchema,
    partialUpdateSecurityGroupRuleSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});
