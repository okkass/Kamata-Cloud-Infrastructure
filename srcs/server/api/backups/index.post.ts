import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getBackupService } from "@@/server/service/BackupService";
import { BackupCreateRequest } from "@@/shared/types";
import { backupCreateSchema } from "@@/server/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getBackupService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as BackupCreateRequest,
    backupCreateSchema,
    service.create
  );
});
