import { createResource } from "@@/server/utils/serviceResultHandler";
import { getPermissionFromEvent } from "@@/server/utils/permission";
import { getSnapshotService } from "@@/server/service/SnapshotService";
import { SnapshotCreateRequest } from "@@/shared/types";
import { createSnapshotSchema } from "@@/server/zodSchemas";

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
