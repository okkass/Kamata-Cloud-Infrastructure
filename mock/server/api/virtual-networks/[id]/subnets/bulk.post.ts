import { bulkResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getVirtualNetworkService } from "@/service/VirtualNetworkService";
import type {
  SubnetCreateRequest,
  SubnetPatchRequest,
} from "@app/shared/types";
import { validateUUID } from "@/utils/validate";
import { createSubnetSchema, updateSubnetSchema } from "@/zodSchemas";
import type { BulkRequest } from "@/types/BulkRequest";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service =
    getVirtualNetworkService(permission).getSubnetService(id);

  if (!service) {
    throw createError({
      statusCode: 404,
      statusMessage: "Virtual Network not found",
    });
  }

  const body = (await readBody(event)) as BulkRequest<
    SubnetCreateRequest,
    SubnetPatchRequest
  >;
  return bulkResource(
    body,
    createSubnetSchema,
    updateSubnetSchema,
    service.create,
    service.update,
    service.delete,
    service.list
  );
});
