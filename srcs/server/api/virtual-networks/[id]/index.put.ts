import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import { updateVirtualNetworkSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  const requestBody = await readBody(event);

  const service = getVirtualNetworkService(permission);

  return updateResource(
    id,
    requestBody,
    updateVirtualNetworkSchema,
    service.update
  );
});
