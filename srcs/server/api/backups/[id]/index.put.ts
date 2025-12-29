import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getBackupService } from "@@/server/service/BackupService";
import { backupUpdateSchema } from "@@/server/zodSchemas";
import { BackupPutRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getBackupService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as BackupPutRequest,
    backupUpdateSchema,
    service.update
  );
});
