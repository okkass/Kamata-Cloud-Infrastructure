import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getBackupService } from "@/service/BackupService";
import { backupUpdateSchema } from "@/zodSchemas";
import { BackupPutRequest } from "@app/shared/types";

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
