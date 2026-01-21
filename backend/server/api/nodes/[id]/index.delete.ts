import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };

  setResponseStatus(event, 204);
  return deleteResource(id, service.delete);
});
