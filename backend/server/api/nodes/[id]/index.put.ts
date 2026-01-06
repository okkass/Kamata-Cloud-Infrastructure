import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";
import { NodePatchRequest } from "@app/shared/types";
import { updateNodeSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as NodePatchRequest,
    updateNodeSchema,
    service.update
  );
});
