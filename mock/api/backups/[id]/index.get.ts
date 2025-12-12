import { z } from "zod";
import { getBackupById } from "../../../services/backupService";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.uuid();

  const id = event.context.params?.id;
  const res = paramsSchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }

  const backupId = res.data;
  const backup = getBackupById(backupId);
  if (!backup) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Backup not found",
      status: 404,
    };
  }
  return backup;
});
