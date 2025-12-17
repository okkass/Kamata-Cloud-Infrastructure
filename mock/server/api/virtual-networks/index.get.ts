import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualNetworkService(permission);

  return getResourceList(service.list);
});
