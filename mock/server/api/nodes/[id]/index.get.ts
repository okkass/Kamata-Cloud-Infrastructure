import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
