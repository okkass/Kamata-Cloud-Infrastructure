import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSecurityGroupService } from "@@/server/service/SecurityGroupService";
import { SecurityGroupCreateRequest } from "@@/shared/types";
import { createSecurityGroupSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSecurityGroupService(permission);
  setResponseStatus(event, 201);
  return createResource(
    body as SecurityGroupCreateRequest,
    createSecurityGroupSchema,
    service.create
  );
});
