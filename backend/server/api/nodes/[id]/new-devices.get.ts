import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getNodeService } from "@/service/NodeService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  return getResourceList(() => service.listNewDevices(id));
});
