import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getSnapshotService(permission);

  return getResourceList(service.list);
});
