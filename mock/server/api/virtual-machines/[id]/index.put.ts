import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { updateVirtualMachineSchema } from "@/zodSchemas";
import type { VirtualMachinePutRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  const { id } = event.context.params as { id: string };

  // リクエストボディをパース
  const body = await readBody(event);

  return updateResource(
    id,
    body as VirtualMachinePutRequest,
    updateVirtualMachineSchema,
    service.update
  );
});
