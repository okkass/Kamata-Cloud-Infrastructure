import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";
import { getResource } from "@/utils/serviceResultHandler";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);

  return getResource(permission.id, service.getById);
});
