import { getResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getInstanceTypeService } from "@@/server/service/InstanceTypeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getInstanceTypeService(permission);

  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
