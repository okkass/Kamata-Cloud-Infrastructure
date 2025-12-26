import { bulkResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getVirtualNetworkService } from "@@/server/service/VirtualNetworkService";
import type {
  SubnetCreateRequest,
  SubnetPatchRequest,
} from "@@/shared/types";
import { validateUUID } from "@@/server/utils/validate";
import { createSubnetSchema, updateSubnetSchema } from "@@/server/zodSchemas";
import type { BulkRequest } from "@@/server/types/BulkRequest";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const { id } = event.context.params as { id: string };
  validateUUID(id);

  const service = getVirtualNetworkService(permission).getSubnetService(id);

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
