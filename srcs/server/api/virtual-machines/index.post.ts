import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualMachineService } from "@@/server/service/VirtualMachineService";
import { createVirtualMachineSchema } from "@@/server/zodSchemas";
import type { VirtualMachineCreateRequest } from "@@/shared/types";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const service = getVirtualMachineService(permission);

  // リクエストボディをパース
  const body = await readBody(event);

  setResponseStatus(event, 201);
  return createResource(
    body as VirtualMachineCreateRequest,
    createVirtualMachineSchema,
    service.create
  );
});
