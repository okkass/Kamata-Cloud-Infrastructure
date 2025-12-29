import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getUserService } from "@@/server/service/UserService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  return getResourceList(service.list);
});
