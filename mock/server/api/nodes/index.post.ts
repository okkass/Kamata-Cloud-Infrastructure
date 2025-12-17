import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";
import { NodeCreateRequest } from "@app/shared/types";
import { addNodeSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getNodeService(permission);

  return createResource(
    body as NodeCreateRequest,
    addNodeSchema,
    service.create
  );
});
