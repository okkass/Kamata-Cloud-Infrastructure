import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getUserService } from "@@/server/service/UserService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getUserService(permission);
  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
