import { updateResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import { partialUpdateSubnetSchema } from "@/zodSchemas";
import type { SubnetPatchRequest } from "@app/shared/types";
import { validateUUID } from "@/utils/validate";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id, subnetId } = event.context.params as {
    id: string;
    subnetId: string;
  };
  validateUUID(id);

  const service = getVirtualNetworkService(permission).getSubnetService(id);
  const requestBody = await readBody<SubnetPatchRequest>(event);

  return updateResource(
    subnetId,
    requestBody,
    partialUpdateSubnetSchema,
    service.update
  );
});
