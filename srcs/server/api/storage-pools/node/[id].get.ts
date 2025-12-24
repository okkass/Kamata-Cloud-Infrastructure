import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getStoragePoolService } from "@@/server/service/StoragePoolService";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler((event) => {
  // モックなので ID パラメータは無視して全件返す
  const permission = getPermissionFromEvent(event);
  const service = getStoragePoolService(permission);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  return getResourceList(service.list);
});
