import { backupService } from "../../../services/backupService";
import { validateUuid, validateBody } from "@utils/validate";
import { backupPatchSchema } from "@/schemas/backupSchemas";
import type { BackupPutRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const idRes = validateUuid(id);
  if (!idRes.success) {
    setResponseStatus(event, idRes.error.status);
    return idRes.error;
  }
  const backupId = idRes.data;

  const requestBody = await readBody(event);
  const bodyRes = validateBody<BackupPutRequest>(
    requestBody,
    backupPatchSchema
  );
  if (!bodyRes.success) {
    setResponseStatus(event, bodyRes.error.status);
    return bodyRes.error;
  }
  const updateData = bodyRes.data;

  const res = backupService.update(backupId, updateData);
  if (!res.success) {
    setResponseStatus(event, res.status ?? 500);
    return res.error;
  }

  setResponseStatus(event, res.status ?? 200);
  return res.data;
});
