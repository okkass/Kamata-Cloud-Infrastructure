import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualMachineService } from "@/service/VirtualMachineService";
import { createVirtualMachineSchema } from "@/zodSchemas";
import type { VirtualMachineCreateRequest } from "@app/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  // リクエストボディをパース
  const body = await readBody(event);

  return createResource(
    body as VirtualMachineCreateRequest,
    createVirtualMachineSchema,
    service.create
  );
});
