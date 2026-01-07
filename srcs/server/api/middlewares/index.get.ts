import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getMiddlewareService } from "@@/server/service/MiddlewareService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getMiddlewareService(permission);

  return getResourceList(service.list);
});
