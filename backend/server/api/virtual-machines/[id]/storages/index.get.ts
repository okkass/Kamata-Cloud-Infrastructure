import { getResourceList } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler((event) => {
  const permission = getPermissionFromEvent(event);

  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service = getVirtualMachineService(permission).getStorageService(id);
  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Machine not found",
    });
  }

  return getResourceList(service.list);
});
