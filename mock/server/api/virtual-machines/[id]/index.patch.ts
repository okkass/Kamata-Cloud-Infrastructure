import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { partialUpdateVirtualMachineSchema } from "@/zodSchemas";
import type { VirtualMachinePatchRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  const { id } = event.context.params as { id: string };

  // リクエストボディをパース
  const body = await readBody(event);

  return updateResource(
    id,
    body as VirtualMachinePatchRequest,
    partialUpdateVirtualMachineSchema,
    service.update
  );
});
