import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import { updateSubnetSchema } from "@/zodSchemas";
import type { SubnetPutRequest } from "@app/shared/types";
import { validateUUID } from "@/utils/validate";

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
