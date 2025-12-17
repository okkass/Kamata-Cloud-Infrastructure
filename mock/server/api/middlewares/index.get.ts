import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getMiddlewareService } from "@/service/MiddlewareService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getMiddlewareService(permission);

  return getResourceList(service.list);
});
