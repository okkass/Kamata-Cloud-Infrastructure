import { updateResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import { updateSubnetSchema } from "@@/server/zodSchemas";
import type { SubnetPutRequest } from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, subnetId } = event.context.params as {
    id: string;
    subnetId: string;
  };
  validateUUID(id);

  const service = getVirtualNetworkService(permission).getSubnetService(id);
  const requestBody = await readBody<SubnetPutRequest>(event);

  return updateResource(
    subnetId,
    requestBody,
    updateSubnetSchema,
    service.update
  );
});
