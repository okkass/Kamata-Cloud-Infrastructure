import { getResourceList } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getStoragePoolService } from "@@/server/service/StoragePoolService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getStoragePoolService(permission);

  return getResourceList(service.list);
});
