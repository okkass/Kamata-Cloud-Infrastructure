import { getResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getStoragePoolService } from "@/service/StoragePoolService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getStoragePoolService(permission);
  const { id } = event.context.params as { id: string };

  return getResource(id, service.getByNodeId);
});
