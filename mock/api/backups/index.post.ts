export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    targetStorageId: z.uuid(),
    targetVirtualMachineId: z.uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(1024).optional(),
  });

  const res = bodySchema.safeParse(await readBody<BackupCreateRequest>(event));
  if (!res.success) {
    event.node.res.statusCode = 400;
    const errorResponse: ErrorResponse = {
      type: "Invalid request",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
    return errorResponse;
  }

  const data = res.data as BackupCreateRequest;

  if (!getVirtualMachineById(data.targetVirtualMachineId)) {
    event.node.res.statusCode = 404;
    const errorResponse: ErrorResponse = {
      type: "Not Found",
      detail: "Target virtual machine not found",
      status: 404,
    };
    return errorResponse;
  }

  const storage = getStorage(data.targetStorageId, data.targetVirtualMachineId);
  if (!storage) {
    event.node.res.statusCode = 404;
    const errorResponse: ErrorResponse = {
      type: "Not Found",
      detail: "Target storage not found",
      status: 404,
    };
    return errorResponse;
  }

  const backup = addBackup(data);
  if (!backup) {
    event.node.res.statusCode = 500;
    const errorResponse: ErrorResponse = {
      type: "Internal Server Error",
      detail: "Failed to create backup",
      status: 500,
    };
    return errorResponse;
  }

  return backup;
});
