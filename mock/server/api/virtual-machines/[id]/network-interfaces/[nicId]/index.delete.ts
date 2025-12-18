import { deleteResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);

  const { id, nicId } = event.context.params as { id: string; nicId: string };
  validateUUID(id);
  const service =
    getVirtualMachineService(permission).getNetworkInterfaceService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  return deleteResource(nicId, service.delete);
});
