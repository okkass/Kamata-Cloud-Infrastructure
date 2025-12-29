import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getNodeService } from "~~/server/service/NodeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
