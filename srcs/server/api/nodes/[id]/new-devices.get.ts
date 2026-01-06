import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getNodeService } from "@@/server/service/NodeService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getNodeService(permission);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  return getResourceList(() => service.listNewDevices(id));
});
