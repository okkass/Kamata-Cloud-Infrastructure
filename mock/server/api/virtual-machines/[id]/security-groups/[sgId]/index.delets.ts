import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, sgId } = event.context.params as { id: string; sgId: string };
  validateUUID(id);

  const service =
    getVirtualMachineService(permission).getVmSecurityGroupService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  return deleteResource(sgId, service.delete);
});
