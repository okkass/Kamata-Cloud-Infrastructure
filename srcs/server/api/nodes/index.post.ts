import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getNodeService } from "@@/server/service/NodeService";
import { NodeCreateRequest } from "@@/shared/types";
import { addNodeSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getNodeService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as NodeCreateRequest,
    addNodeSchema,
    service.create
  );
});
