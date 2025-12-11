import { getVirtualMachineById } from "@/services/virtualMachineService";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.uuid();
  const id = event.context.params?.id;
  const res = paramsSchema.safeParse(id);
  if (!res.success) {
    event.node.res.statusCode = 400;
    return {
      type: "Invalid UUID",
      detail: z.treeifyError(res.error).errors.join(", "),
      status: 400,
    };
  }
  const vmId = res.data;
  const vm = getVirtualMachineById(vmId);
  if (!vm) {
    event.node.res.statusCode = 404;
    return {
      type: "Not Found",
      detail: "Virtual Machine not found",
      status: 404,
    };
  }
  return vm;
});
