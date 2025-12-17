import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getBackupService } from "@/service/BackupService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getBackupService(permission);

  return getResourceList(service.list);
});
