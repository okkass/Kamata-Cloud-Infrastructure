import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { partialUpdateVirtualMachineSchema } from "@@/server/zodSchemas";
import type { VirtualMachinePatchRequest } from "@@/shared/types";

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
