import { bulkResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import type {
  SecurityRuleCreateRequest,
  SecurityRulePatchRequest,
} from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";
import {
  createSecurityGroupRuleSchema,
  updateSecurityGroupRuleSchema,
} from "@@/server/zodSchemas";
import type { BulkRequest } from "@@/server/types/BulkRequest";

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
    updateSecurityGroupRuleSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});
