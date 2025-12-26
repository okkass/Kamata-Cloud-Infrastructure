import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };

  const service = getVirtualNetworkService(permission);

  return getResource(id, service.getById);
});
