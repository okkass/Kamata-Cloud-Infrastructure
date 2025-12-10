import { z } from "zod";
import { deleteBackup } from "../../../services/backupService";

export default defineEventHandler(async (event) => {
  const querySchema = z.uuid();

  const id = event.context.params?.id;
  const res = querySchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }

  const backupId = res.data;
  const deleted = deleteBackup(backupId);
  if (!deleted) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Backup not found",
      status: 404,
    };
  }
  event.node.res.statusCode = 204;
  return;
});
