import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";
import { NodeCreateRequest } from "@app/shared/types";
import { addNodeSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  console.log("POST /api/nodes called");
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
