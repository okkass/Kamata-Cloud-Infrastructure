import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getStoragePoolService } from "@/service/StoragePoolService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getStoragePoolService(permission);

  return getResourceList(service.list);
});
