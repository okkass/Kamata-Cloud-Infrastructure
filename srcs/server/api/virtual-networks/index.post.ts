import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import { VirtualNetworkCreateRequest } from "@@/shared/types";
import { createVirtualNetworkSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getVirtualNetworkService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as VirtualNetworkCreateRequest,
    createVirtualNetworkSchema,
    service.create
  );
});
