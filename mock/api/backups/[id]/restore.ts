import { z } from "zod";
import { getStorage } from "../../../services/virtualMachineService";
import { getBackupById } from "../../../services/backupService";
import type { VirtualMachineResponse } from "@app/shared/types";

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

  const backup = getBackupById(backupId);
  if (!backup) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Backup not found",
      status: 404,
    };
  }

  if (!backup.targetVirtualMachine || !backup.targetStorage) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid Backup",
      detail: "Backup is missing target virtual machine or storage information",
      status: 400,
    };
  }

  return backup.targetVirtualMachine as VirtualMachineResponse;
});
