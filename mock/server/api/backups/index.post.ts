import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getBackupService } from "@/service/BackupService";
import { BackupCreateRequest } from "@app/shared/types";
import { backupCreateSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getBackupService(permission);

  return createResource(
    body as BackupCreateRequest,
    backupCreateSchema,
    service.create
  );
});
