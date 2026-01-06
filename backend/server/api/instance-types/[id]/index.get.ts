import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getInstanceTypeService } from "@/service/InstanceTypeService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getInstanceTypeService(permission);

  const { id } = event.context.params as { id: string };

  return getResource(id, service.getById);
});
