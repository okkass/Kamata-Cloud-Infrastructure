import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getBackupService } from "@/service/BackupService";
import { backupPartialUpdateSchema } from "@/zodSchemas";
import { BackupPatchRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getBackupService(permission);
  const { id } = event.context.params as { id: string };

  return updateResource(
    id,
    body as BackupPatchRequest,
    backupPartialUpdateSchema,
    service.update
  );
});
