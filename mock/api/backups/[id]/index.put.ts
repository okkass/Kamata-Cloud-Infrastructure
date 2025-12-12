import { z } from "zod";
import { updateBackup } from "../../../services/backupService";
import type { BackupResponse, BackupPutRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.uuid();
  const bodySchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1024).optional(),
  });

  const id = event.context.params?.id;
  const idRes = paramsSchema.safeParse(id);
  if (!idRes.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(idRes.error).errors.join(", "),
      status: 400,
    };
  }

  const bodyRes = bodySchema.safeParse(await readBody<BackupPutRequest>(event));
  if (!bodyRes.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(bodyRes.error).errors.join(", "),
      status: 400,
    };
  }

  const backupId = idRes.data;
  const data = bodyRes.data as BackupPutRequest;

  const updatedBackup = updateBackup(backupId, data);
  if (!updatedBackup) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Backup not found",
      status: 404,
    };
  }

  return updatedBackup as BackupResponse;
});
