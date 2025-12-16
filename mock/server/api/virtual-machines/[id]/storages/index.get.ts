import { getStoragesByVirtualMachineId } from "@/services/VirtualMachineService";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const querySchema = z.uuid();
  const res = querySchema.safeParse(event.context.params?.id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid UUID",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  const vmId = res.data;
  const storages = getStoragesByVirtualMachineId(vmId);
  if (!storages) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Virtual Machine not found",
      status: 404,
    };
  }
  return storages;
});
