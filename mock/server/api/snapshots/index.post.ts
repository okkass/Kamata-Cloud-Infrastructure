import { createResource } from "@/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@/utils/permission";
import { getSnapshotService } from "@/service/SnapshotService";
import { SnapshotCreateRequest } from "@app/shared/types";
import { createSnapshotSchema } from "@/zodSchemas";

export default defineEventHandler(async (event) => {
  const permission = getPermissionFromEvent(event);
  const body = await readBody(event);
  const service = getSnapshotService(permission);

  setResponseStatus(event, 201);
  return createResource(
    body as SnapshotCreateRequest,
    createSnapshotSchema,
    service.create
  );
});
