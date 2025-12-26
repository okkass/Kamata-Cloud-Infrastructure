import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getNodeService } from "@@/server/service/NodeService";
import { NodePatchRequest } from "@@/shared/types";
import { partialUpdateNodeSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as NodePatchRequest,
    partialUpdateNodeSchema,
    service.update
  );
});
