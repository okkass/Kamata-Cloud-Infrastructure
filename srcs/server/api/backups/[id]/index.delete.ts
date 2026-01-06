import { deleteResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getBackupService } from "@@/server/service/BackupService";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);
  const service = getBackupService(permission);
  const { id } = event.context.params as { id: string };

  return deleteResource(id, service.delete);
});
