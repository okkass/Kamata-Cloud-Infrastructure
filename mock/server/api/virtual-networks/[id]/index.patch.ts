import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import { partialUpdateVirtualNetworkSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  const requestBody = await readBody(event);

  const service = getVirtualNetworkService(permission);

  return updateResource(
    id,
    requestBody,
    partialUpdateVirtualNetworkSchema,
    service.update
  );
});
