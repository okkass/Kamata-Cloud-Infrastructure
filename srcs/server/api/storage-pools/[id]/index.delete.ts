import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getStoragePoolService } from "@@/server/service/StoragePoolService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getStoragePoolService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
