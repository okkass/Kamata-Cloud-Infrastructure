import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getUserService } from "@/service/UserService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);
  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
