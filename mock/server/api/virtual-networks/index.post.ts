import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import { VirtualNetworkCreateRequest } from "@app/shared/types";
import { createVirtualNetworkSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getVirtualNetworkService(permission);

  return createResource(
    body as VirtualNetworkCreateRequest,
    createVirtualNetworkSchema,
    service.create
  );
});
