import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  return getResourceList(service.list);
});
