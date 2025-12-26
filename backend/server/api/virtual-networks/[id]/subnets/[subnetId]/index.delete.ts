import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const { id, subnetId } = event.context.params as {
    id: string;
    subnetId: string;
  };
  validateUUID(id);

  const service = getVirtualNetworkService(permission).getSubnetService(id);
  return deleteResource(subnetId, service.delete);
});
