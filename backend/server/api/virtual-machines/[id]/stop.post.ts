import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";

export default defineEventHandler(async (event) => {
  const permissions = getPermissionFromEvent(event);

  const { id } = event.context.params as { id: string };
  const service = getVirtualMachineService(permissions).getPowerService(id);

  const res = await service.stop();

  if (!res.success) {
    throw createError({
      statusCode: 500,
      statusMessage: res.error.reason,
    });
  }

  setResponseStatus(event, 202);
  return { message: "Stop initiated" };
});
